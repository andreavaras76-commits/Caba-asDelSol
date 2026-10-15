require('dotenv').config();

// Al pegar valores en el panel de Vercel suelen colarse espacios o tabs: se limpian todos
for (const k of Object.keys(process.env)) if (typeof process.env[k] === 'string') process.env[k] = process.env[k].trim();

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.warn(`⚠️  Faltan variables de entorno: ${missing.join(', ')}`);
}

const SITE_URL = (process.env.SITE_URL || 'https://www.delsoltafidelvalle.com.ar').replace(/\/$/, '');

// El sitio propio (con y sin www) siempre está permitido, además de lo que diga CORS_ORIGINS
const withAndWithoutWww = (url) => {
  try {
    const u = new URL(url);
    const host = u.hostname.startsWith('www.') ? u.hostname.slice(4) : u.hostname;
    return [`${u.protocol}//${host}`, `${u.protocol}//www.${host}`];
  } catch {
    return [];
  }
};
const CORS_ORIGINS = [
  ...new Set([...(process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((o) => o.trim().replace(/\/$/, '')).filter(Boolean), ...withAndWithoutWww(SITE_URL)]),
];

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 4000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  SITE_URL,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGINS,
  CLOUDINARY: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'cabanas-del-sol',
  },
};
