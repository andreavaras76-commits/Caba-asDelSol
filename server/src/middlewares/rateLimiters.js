const rateLimit = require('express-rate-limit');

/*
 * Nota: en serverless cada instancia tiene su propio contador en memoria.
 * Es suficiente para frenar abusos básicos; para algo estricto usar un store externo (Redis/Upstash).
 */
const handler = (message) => (req, res) => res.status(429).json({ ok: false, data: null, message });

/**
 * IP real del visitante. En Vercel el front proxea /api al backend, así que req.ip podría ser
 * la del proxy (y un solo intento fallido bloquearía a todos): tomamos la primera de x-forwarded-for,
 * que el edge de Vercel completa con la IP del cliente.
 */
const clientIp = (req) => {
  const fwd = process.env.VERCEL && req.headers['x-forwarded-for'];
  return fwd ? String(fwd).split(',')[0].trim() : req.ip;
};

const base = { standardHeaders: 'draft-7', legacyHeaders: false, keyGenerator: clientIp };

/** Login: 10 intentos cada 15 minutos por IP */
const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: handler('Demasiados intentos de inicio de sesión. Probá de nuevo en 15 minutos.'),
});

/** Consultas públicas (POST): 15 cada 10 minutos por IP */
const inquiryLimiter = rateLimit({
  ...base,
  windowMs: 10 * 60 * 1000,
  limit: 15,
  handler: handler('Recibimos muchas consultas seguidas. Esperá unos minutos o escribinos directo por WhatsApp.'),
});

/**
 * Lecturas públicas: 1500 cada 15 minutos por IP.
 * Generoso a propósito: con CGNAT muchas personas comparten la IP de su operadora móvil.
 */
const publicLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 1500,
  handler: handler('Demasiadas solicitudes. Probá de nuevo en unos minutos.'),
});

module.exports = { loginLimiter, inquiryLimiter, publicLimiter };
