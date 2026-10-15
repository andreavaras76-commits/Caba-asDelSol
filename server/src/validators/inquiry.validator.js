const { body, query } = require('express-validator');
const { text, bool, int, date, oneOf } = require('./common');
const { INQUIRY_TYPES, INQUIRY_STATUS, SLEEPING_OPTIONS, EVENT_MIN_HOURS, LIMITS } = require('../utils/constants');

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const notPast = (label) => (value) => {
  if (value && new Date(value) < new Date(startOfToday().getTime() - 24 * 3600 * 1000)) {
    throw new Error(`${label} no puede ser una fecha pasada`);
  }
  return true;
};

const isType = (...types) => (value, { req }) => types.includes(req.body.type);

const create = [
  oneOf('type', INQUIRY_TYPES, { required: true, label: 'El tipo de consulta' }),
  text('name', { required: true, min: 2, max: LIMITS.NAME_MAX, label: 'Tu nombre' }),
  body('phone')
    .optional({ values: 'falsy' })
    .matches(/^[\d\s()+-]{8,20}$/)
    .withMessage('Ingresá un teléfono válido'),

  body('cabin').if(isType('cabana')).exists({ values: 'falsy' }).withMessage('Elegí una cabaña'),
  body('cabin').optional({ values: 'falsy' }).isMongoId().withMessage('Cabaña inválida'),
  body('promotion').optional({ values: 'falsy' }).isMongoId().withMessage('Promoción inválida'),
  body('promotion').if(isType('promo')).exists({ values: 'falsy' }).withMessage('Falta la promoción'),

  body('checkIn').if(isType('cabana')).exists({ values: 'falsy' }).withMessage('Elegí la fecha de entrada'),
  body('checkOut').if(isType('cabana')).exists({ values: 'falsy' }).withMessage('Elegí la fecha de salida'),
  date('checkIn', { label: 'La fecha de entrada' }),
  date('checkOut', { label: 'La fecha de salida' }),
  body('checkIn').custom(notPast('La fecha de entrada')),
  body('checkOut').custom((out, { req }) => {
    if (out && req.body.checkIn && new Date(out) <= new Date(req.body.checkIn)) {
      throw new Error('La salida debe ser posterior a la entrada');
    }
    if (out && !req.body.checkIn) throw new Error('Elegí también la fecha de entrada');
    return true;
  }),

  body('guests').if(isType('cabana')).exists({ values: 'null' }).withMessage('Indicá la cantidad de huéspedes'),
  int('guests', { min: 1, max: LIMITS.GUESTS_MAX, label: 'Los huéspedes' }),
  bool('pets', 'Mascota'),
  body('sleepingPreference').optional({ values: 'falsy' }).isIn(SLEEPING_OPTIONS).withMessage('La preferencia de cama no es válida'),

  body('eventType').if(isType('evento')).exists({ values: 'falsy' }).withMessage('Contanos qué tipo de evento es'),
  text('eventType', { max: 60, label: 'El tipo de evento' }),
  body('eventDate').if(isType('evento')).exists({ values: 'falsy' }).withMessage('Elegí la fecha del evento'),
  date('eventDate', { label: 'La fecha del evento' }),
  body('eventDate').custom(notPast('La fecha del evento')),
  body('people').if(isType('evento')).exists({ values: 'null' }).withMessage('Indicá la cantidad de personas'),
  int('people', { min: 1, max: LIMITS.GUESTS_MAX, label: 'La cantidad de personas' }),
  body('hours').if(isType('evento')).exists({ values: 'null' }).withMessage('Indicá cuántas horas'),
  int('hours', { min: EVENT_MIN_HOURS, max: 24, label: 'Las horas del evento' }),
  bool('withLodging', 'Con hospedaje'),

  text('comments', { max: 500, label: 'El comentario' }),
  text('message', { max: 2000, label: 'El mensaje' }),
];

const updateStatus = [
  oneOf('status', INQUIRY_STATUS, { label: 'El estado' }),
  text('notes', { max: 1000, label: 'Las notas' }),
];

const list = [
  query('status').optional({ values: 'falsy' }).isIn(INQUIRY_STATUS).withMessage('Estado inválido'),
  query('type').optional({ values: 'falsy' }).isIn(INQUIRY_TYPES).withMessage('Tipo inválido'),
  query('cabin').optional({ values: 'falsy' }).isMongoId().withMessage('Cabaña inválida'),
  query('promotion').optional({ values: 'falsy' }).isMongoId().withMessage('Promoción inválida'),
  query('from').optional({ values: 'falsy' }).isISO8601().withMessage('Fecha "desde" inválida'),
  query('to').optional({ values: 'falsy' }).isISO8601().withMessage('Fecha "hasta" inválida'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = { create, updateStatus, list };
