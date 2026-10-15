const { matchedData } = require('express-validator');

const bodyData = (req) => prune(matchedData(req, { locations: ['body'], includeOptionals: true }));

function prune(obj) {
  if (Array.isArray(obj)) return obj.map(prune);
  if (!obj || typeof obj !== 'object' || obj instanceof Date) return obj;
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, prune(v)])
  );
}

function flatten(obj, prefix = '', out = {}) {
  Object.entries(obj).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const isPlainObject = value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && value.constructor === Object;
    if (isPlainObject) flatten(value, path, out);
    else out[path] = value;
  });
  return out;
}

const paginate = (req, defaultLimit = 20) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

module.exports = { bodyData, flatten, paginate };
