const { body } = require('express-validator');
const { text, bool, int, number, url, whatsapp } = require('./common');
const { LIMITS } = require('../utils/constants');

const update = [
  text('businessName', { max: LIMITS.NAME_MAX, label: 'El nombre del negocio' }),
  text('location', { max: LIMITS.NAME_MAX, label: 'La localidad' }),
  text('slogan', { max: 200, label: 'El slogan' }),

  whatsapp('contact.whatsapp'),
  text('contact.phoneDisplay', { max: 30, label: 'El teléfono visible' }),
  body('contact.email').optional({ values: 'falsy' }).isEmail().withMessage('El email de contacto no es válido'),
  url('contact.website', 'La web'),

  url('social.instagram', 'El link de Instagram'),
  url('social.threads', 'El link de Threads'),
  url('social.facebook', 'El link de Facebook'),

  text('address.street', { max: 200, label: 'La dirección' }),
  text('address.city', { max: 80, label: 'La ciudad' }),
  text('address.postalCode', { max: 12, label: 'El código postal' }),
  text('address.province', { max: 80, label: 'La provincia' }),
  text('address.country', { max: 80, label: 'El país' }),
  url('address.mapsUrl', 'El link de Google Maps'),
  number('address.lat', { min: -90, max: 90, label: 'La latitud' }),
  number('address.lng', { min: -180, max: 180, label: 'La longitud' }),

  text('hero.title', { max: LIMITS.TITLE_MAX, label: 'El título del hero' }),
  text('hero.subtitle', { max: LIMITS.SHORT_TEXT_MAX, label: 'El subtítulo del hero' }),

  text('about.title', { max: LIMITS.TITLE_MAX, label: 'El título de Nosotros' }),
  text('about.text', { max: LIMITS.LONG_TEXT_MAX, label: 'El texto de Nosotros' }),
  body('about.stats').optional().isArray({ max: 6 }).withMessage('Hasta 6 contadores'),
  body('about.stats.*.value').isFloat({ min: 0 }).withMessage('El valor del contador debe ser un número').toFloat(),
  body('about.stats.*.suffix').optional().isString().isLength({ max: 10 }).withMessage('Sufijo de hasta 10 caracteres'),
  body('about.stats.*.label').isString().trim().isLength({ min: 2, max: 60 }).withMessage('Etiqueta del contador entre 2 y 60 caracteres'),

  text('events.title', { max: LIMITS.TITLE_MAX, label: 'El título de Eventos' }),
  text('events.text', { max: LIMITS.LONG_TEXT_MAX, label: 'El texto de Eventos' }),
  int('events.capacity', { min: 1, max: 500, label: 'La capacidad de eventos' }),
  body('events.includes').optional().isArray({ max: 20 }).withMessage('Hasta 20 ítems incluidos'),
  body('events.includes.*').isString().trim().isLength({ min: 2, max: 60 }).withMessage('Cada ítem incluido entre 2 y 60 caracteres'),
  bool('events.lodgingOptional', 'Hospedaje opcional'),

  bool('showPrices', 'Mostrar precios'),
  text('seo.title', { max: 70, label: 'El título SEO' }),
  text('seo.description', { max: 160, label: 'La descripción SEO' }),
];

module.exports = { update };
