const { body, param } = require('express-validator');
const { LIMITS } = require('../utils/constants');

/*
 * Reglas reutilizables. Cada validator espeja el esquema Zod homónimo de client/src/schemas.
 * `partial = true` vuelve todo opcional (para PUT/PATCH).
 */

const mongoIdParam = (name = 'id') => param(name).isMongoId().withMessage('Identificador inválido');

const opt = (chain, partial) => (partial ? chain.optional() : chain);

const text = (field, { min = 0, max = LIMITS.SHORT_TEXT_MAX, required = false, label = field, partial = false } = {}) => {
  let chain = body(field);
  if (required && !partial) {
    chain = chain.exists({ values: 'falsy' }).withMessage(`${label} es obligatorio`).bail();
  } else {
    chain = chain.optional({ values: 'null' });
  }
  return chain
    .isString()
    .withMessage(`${label} debe ser texto`)
    .bail()
    .trim()
    .isLength({ min: required ? min : 0, max })
    .withMessage(min && required ? `${label} debe tener entre ${min} y ${max} caracteres` : `${label} admite hasta ${max} caracteres`);
};

const bool = (field, label = field) =>
  body(field).optional().isBoolean({ strict: true }).withMessage(`${label} debe ser verdadero o falso`);

const int = (field, { min = 0, max = 100000, required = false, label = field, partial = false } = {}) => {
  let chain = body(field);
  chain = required && !partial ? chain.exists({ values: 'null' }).withMessage(`${label} es obligatorio`).bail() : chain.optional({ values: 'null' });
  return chain.isInt({ min, max }).withMessage(`${label} debe ser un número entero entre ${min} y ${max}`).toInt();
};

const number = (field, { min = 0, max = 1e9, label = field } = {}) =>
  body(field).optional({ values: 'null' }).isFloat({ min, max }).withMessage(`${label} debe ser un número entre ${min} y ${max}`).toFloat();

const date = (field, { required = false, label = field, partial = false } = {}) => {
  let chain = body(field);
  chain = required && !partial ? chain.exists({ values: 'falsy' }).withMessage(`${label} es obligatoria`).bail() : chain.optional({ values: 'falsy' });
  return chain.isISO8601().withMessage(`${label} no es una fecha válida`).bail().toDate();
};

const oneOf = (field, values, { required = false, label = field, partial = false } = {}) => {
  let chain = body(field);
  chain = required && !partial ? chain.exists({ values: 'falsy' }).withMessage(`${label} es obligatorio`).bail() : chain.optional();
  return chain.isIn(values).withMessage(`${label} no es válido`);
};

const arrayOf = (field, values, label = field) => [
  body(field).optional().isArray().withMessage(`${label} debe ser una lista`),
  body(`${field}.*`).isIn(values).withMessage(`${label} contiene un valor no válido`),
];

const mongoIdArray = (field, label = field) => [
  body(field).optional().isArray().withMessage(`${label} debe ser una lista`),
  body(`${field}.*`).isMongoId().withMessage(`${label} contiene un identificador inválido`),
];

const url = (field, label = field) =>
  body(field)
    .optional({ values: 'falsy' })
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage(`${label} debe ser una URL válida (https://…)`);

/** Teléfono de WhatsApp: sólo dígitos con código de país, ej. 5493815027738 */
const whatsapp = (field, { required = false, label = 'El WhatsApp', partial = false } = {}) => {
  let chain = body(field);
  chain = required && !partial ? chain.exists({ values: 'falsy' }).withMessage(`${label} es obligatorio`).bail() : chain.optional({ values: 'falsy' });
  return chain
    .customSanitizer((v) => String(v).replace(/\D/g, ''))
    .matches(/^\d{10,15}$/)
    .withMessage(`${label} debe tener entre 10 y 15 dígitos, con código de país (ej: 5493815027738)`);
};

module.exports = { mongoIdParam, opt, text, bool, int, number, date, oneOf, arrayOf, mongoIdArray, url, whatsapp };
