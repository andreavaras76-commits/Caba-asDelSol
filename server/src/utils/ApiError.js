/** Error con código HTTP para lanzar desde controladores y middlewares */
class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static badRequest(msg = 'Solicitud inválida', errors) {
    return new ApiError(400, msg, errors);
  }
  static unauthorized(msg = 'No autorizado') {
    return new ApiError(401, msg);
  }
  static forbidden(msg = 'No tenés permisos para esta acción') {
    return new ApiError(403, msg);
  }
  static notFound(msg = 'Recurso no encontrado') {
    return new ApiError(404, msg);
  }
}

module.exports = ApiError;
