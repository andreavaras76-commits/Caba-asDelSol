const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Ejecuta una lista de reglas de express-validator y, si alguna falla,
 * responde 400 con { field, message } por cada error (mismo formato que muestra el front).
 */
module.exports = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
    next(ApiError.badRequest(errors[0].message, errors));
  },
];
