/** Respuestas consistentes: { ok, data, message } */
const success = (res, data = null, message = 'OK', status = 200) => res.status(status).json({ ok: true, data, message });

const created = (res, data, message = 'Creado correctamente') => success(res, data, message, 201);

module.exports = { success, created };
