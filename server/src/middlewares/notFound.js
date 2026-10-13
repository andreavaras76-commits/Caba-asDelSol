const ApiError = require('../utils/ApiError');

module.exports = (req, res, next) => next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
