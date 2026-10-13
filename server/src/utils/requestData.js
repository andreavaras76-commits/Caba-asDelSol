const { matchedData } = require('express-validator');

/**
 * Devuelve SOLO los campos del body que pasaron por un validador (lista blanca).
 * Evita que alguien inyecte campos no previstos (ej: role, password, _id).
 */
const bodyData = (req) => prune(matchedData(req, { locations: ['body'], includeOptionals: true }));

/**
 * Quita las claves `undefined` (campos que no vinieron) pero conserva `null` y '',
 * así un PUT puede vaciar un campo opcional (ej: borrar la fecha de fin de una promo).
 */
function prune(obj) {
  if (Array.isArray(obj)) return obj.map(prune);
  if (!obj || typeof obj !== 'object' || obj instanceof Date) return obj;
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, prune(v)])
  );
}

/**
 * { price: { amount: 1 } } → { 'price.amount': 1 }
 * Los arrays, fechas e ids se asignan completos.
 */
function flatten(obj, prefix = '', out = {}) {
  Object.entries(obj).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const isPlainObject = value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && value.constructor === Object;
    if (isPlainObject) flatten(value, path, out);
    else out[path] = value;
  });
  return out;
}

/** Paginación estándar ?page=&limit= */
const paginate = (req, defaultLimit = 20) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

module.exports = { bodyData, flatten, paginate };
