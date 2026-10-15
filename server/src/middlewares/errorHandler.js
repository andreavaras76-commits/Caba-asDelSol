const env = require('../config/env');

/** Manejo centralizado de errores → siempre { ok: false, data: null, message, errors? } */
// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Error interno del servidor';
  let errors = err.errors || [];

  // Errores conocidos de Mongoose / Multer / JWT traducidos a mensajes claros
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Datos inválidos';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Identificador inválido';
  } else if (err.code === 11000) {
    status = 409;
    const fields = Object.keys(err.keyValue || {});
    const friendly = { username: 'Ese nombre de usuario ya está en uso', phone: 'Ya hay un cliente con ese WhatsApp', slug: 'Ya existe una cabaña con ese slug' };
    message = friendly[fields[0]] || `Ya existe un registro con ese valor (${fields.join(', ')})`;
    errors = fields.map((field) => ({ field, message }));
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'La imagen supera el tamaño máximo permitido' : err.message;
  } else if (err.message === 'Origen no permitido por CORS') {
    status = 403;
    message = 'No pudimos conectarnos con el sistema. Probá de nuevo en unos minutos.';
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    ok: false,
    data: null,
    message: status >= 500 && env.NODE_ENV === 'production' ? 'Algo salió mal de nuestro lado. Probá de nuevo en unos minutos.' : message,
    ...(errors.length && { errors }),
  });
};
