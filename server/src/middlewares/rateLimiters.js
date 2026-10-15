const rateLimit = require('express-rate-limit');

const handler = (message) => (req, res) => res.status(429).json({ ok: false, data: null, message });

const clientIp = (req) => {
  const fwd = process.env.VERCEL && req.headers['x-forwarded-for'];
  return fwd ? String(fwd).split(',')[0].trim() : req.ip;
};

const base = { standardHeaders: 'draft-7', legacyHeaders: false, keyGenerator: clientIp };

const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: handler('Demasiados intentos de inicio de sesión. Probá de nuevo en 15 minutos.'),
});

const inquiryLimiter = rateLimit({
  ...base,
  windowMs: 10 * 60 * 1000,
  limit: 15,
  handler: handler('Recibimos muchas consultas seguidas. Esperá unos minutos o escribinos directo por WhatsApp.'),
});

const publicLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 1500,
  handler: handler('Demasiadas solicitudes. Probá de nuevo en unos minutos.'),
});

module.exports = { loginLimiter, inquiryLimiter, publicLimiter };
