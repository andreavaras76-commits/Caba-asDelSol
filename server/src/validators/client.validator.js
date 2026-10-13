const { body } = require('express-validator');
const { text, date, arrayOf, whatsapp } = require('./common');
const { CLIENT_TAGS, LIMITS } = require('../utils/constants');

const client = (partial = false) => [
  text('name', { required: true, min: 2, max: LIMITS.NAME_MAX, label: 'El nombre', partial }),
  whatsapp('phone', { required: true, partial }),
  body('cabin').optional({ values: 'falsy' }).isMongoId().withMessage('Cabaña inválida'),
  date('lastStay', { label: 'La última estadía' }),
  text('notes', { max: 1000, label: 'Las notas' }),
  ...arrayOf('tags', CLIENT_TAGS, 'Las etiquetas'),
];

const markSent = [
  body('promotion').exists({ values: 'falsy' }).withMessage('Falta la promoción').bail().isMongoId().withMessage('Promoción inválida'),
  body('sent').optional().isBoolean({ strict: true }).withMessage('"sent" debe ser verdadero o falso'),
];

module.exports = { create: client(false), update: client(true), markSent };
