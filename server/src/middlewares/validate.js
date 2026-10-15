const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

module.exports = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    const errors = result.array({ onlyFirstError: true }).map((e) => ({ field: e.path, message: e.msg }));
    next(ApiError.badRequest(errors[0].message, errors));
  },
];
