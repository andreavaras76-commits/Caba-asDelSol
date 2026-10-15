const { body } = require('express-validator');
const { text, bool, int, date, oneOf, mongoIdArray } = require('./common');
const { PROMO_TYPES, SEASONS, LIMITS } = require('../utils/constants');

const promotion = (partial = false) => [
  text('title', { required: true, min: 3, max: LIMITS.TITLE_MAX, label: 'El título', partial }),
  text('description', { max: 2000, label: 'La descripción' }),
  oneOf('type', PROMO_TYPES, { required: true, label: 'El tipo de promoción', partial }),

  body('value')
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('El valor debe ser un número positivo')
    .toFloat(),
  body('value').custom((value, { req }) => {
    const type = req.body.type;
    if (type === 'porcentaje' && !(value >= 1 && value <= 100)) throw new Error('El descuento debe ser entre 1% y 100%');
    if (type === 'precio_especial' && !(value > 0)) throw new Error('Ingresá el precio especial');
    return true;
  }),
  text('valueText', { max: 80, label: 'El texto del beneficio' }),
  body('valueText').custom((value, { req }) => {
    if (req.body.type === 'texto' && !String(value || '').trim()) throw new Error('Escribí el beneficio de la promo');
    return true;
  }),

  bool('appliesToAll', 'Aplica a todas'),
  ...mongoIdArray('cabins', 'Las cabañas'),
  body('cabins').custom((cabins, { req }) => {
    if (req.body.appliesToAll === false && (!Array.isArray(cabins) || !cabins.length)) {
      throw new Error('Elegí al menos una cabaña o marcá "todas"');
    }
    return true;
  }),

  date('startDate', { label: 'La fecha de inicio' }),
  date('endDate', { label: 'La fecha de fin' }),
  body('endDate').custom((end, { req }) => {
    if (end && req.body.startDate && new Date(end) < new Date(req.body.startDate)) {
      throw new Error('La fecha de fin debe ser posterior a la de inicio');
    }
    return true;
  }),

  int('minNights', { min: 1, max: 30, label: 'El mínimo de noches' }),
  oneOf('season', SEASONS, { label: 'La temporada' }),
  bool('featured', 'Destacada'),
  bool('active', 'Activa'),
  int('order', { min: 0, max: 9999, label: 'El orden' }),
];

module.exports = { create: promotion(false), update: promotion(true) };
