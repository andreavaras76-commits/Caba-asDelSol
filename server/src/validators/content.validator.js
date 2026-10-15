const { body } = require('express-validator');
const { text, bool, int, date, oneOf, url, mongoIdArray } = require('./common');
const { GALLERY_CATEGORIES, NEARBY_CATEGORIES, SERVICE_GROUPS, LIMITS } = require('../utils/constants');

const common = [bool('active', 'Activo'), int('order', { min: 0, max: 9999, label: 'El orden' })];

const service = (partial = false) => [
  text('name', { required: true, min: 2, max: 60, label: 'El nombre', partial }),
  text('icon', { required: true, min: 2, max: 40, label: 'El ícono', partial }),
  body('icon').optional().matches(/^[A-Za-z0-9]+$/).withMessage('El ícono debe ser un nombre de Lucide (ej: Wifi)'),
  text('description', { max: LIMITS.SHORT_TEXT_MAX, label: 'La descripción' }),
  oneOf('group', SERVICE_GROUPS, { label: 'El tipo' }),
  ...common,
];

const attraction = (partial = false) => [
  text('name', { required: true, min: 2, max: LIMITS.NAME_MAX, label: 'El nombre', partial }),
  text('description', { max: 1000, label: 'La descripción' }),
  text('distance', { max: 40, label: 'La distancia' }),
  url('mapsUrl', 'El link de Maps'),
  ...common,
];

const faq = (partial = false) => [
  text('question', { required: true, min: 5, max: 200, label: 'La pregunta', partial }),
  text('answer', { required: true, min: 5, max: 2000, label: 'La respuesta', partial }),
  ...common,
];

const review = (partial = false) => [
  text('author', { required: true, min: 2, max: LIMITS.NAME_MAX, label: 'El autor', partial }),
  text('origin', { max: 80, label: 'La procedencia' }),
  int('rating', { min: 1, max: 5, label: 'La puntuación' }),
  text('text', { required: true, min: 10, max: 1500, label: 'La reseña', partial }),
  text('source', { max: 40, label: 'La fuente' }),
  date('date', { label: 'La fecha' }),
  ...common,
];

const galleryCabin = body('cabin').optional({ values: 'falsy' }).isMongoId().withMessage('Cabaña inválida');
const galleryUpload = [oneOf('category', GALLERY_CATEGORIES, { required: true, label: 'La categoría' }), galleryCabin];

const galleryUpdate = [
  text('alt', { max: 160, label: 'El texto alternativo' }),
  oneOf('category', GALLERY_CATEGORIES, { label: 'La categoría' }),
  galleryCabin,
  ...common,
];

const feedbackSubmit = [
  body('rating').exists({ values: 'falsy' }).withMessage('Elegí una puntuación').bail().isInt({ min: 1, max: 5 }).withMessage('La puntuación va de 1 a 5').toInt(),
  text('text', { max: 1500, label: 'El comentario' }),
  text('origin', { max: 80, label: 'De dónde nos visitás' }),
];
const feedbackRequest = [body('client').exists({ values: 'falsy' }).withMessage('Falta el cliente').bail().isMongoId().withMessage('Cliente inválido')];

const reorder = [
  body('ids').exists().withMessage('Enviá el nuevo orden').bail().isArray({ min: 1 }).withMessage('El orden debe ser una lista'),
  ...mongoIdArray('ids', 'El orden'),
];

const phone = (field, label) =>
  body(field).optional({ values: 'falsy' }).matches(/^[\d\s()+-]{6,25}$/).withMessage(`${label} no es válido`);

const nearbyPlace = (partial = false) => [
  text('name', { required: true, min: 2, max: LIMITS.NAME_MAX, label: 'El nombre', partial }),
  oneOf('category', NEARBY_CATEGORIES, { required: true, label: 'La categoría', partial }),
  text('description', { max: LIMITS.SHORT_TEXT_MAX, label: 'La descripción' }),
  phone('phone', 'El teléfono'),
  body('whatsapp')
    .optional({ values: 'falsy' })
    .customSanitizer((v) => String(v).replace(/\D/g, ''))
    .matches(/^\d{10,15}$/)
    .withMessage('El WhatsApp debe tener entre 10 y 15 dígitos, con código de país (ej: 5493815027738)'),
  text('address', { max: 160, label: 'La dirección' }),
  url('mapsUrl', 'El link de Maps'),
  ...common,
];

const specialEvent = (partial = false) => [
  text('title', { required: true, min: 3, max: LIMITS.TITLE_MAX, label: 'El título', partial }),
  text('description', { max: 1000, label: 'La descripción' }),
  date('date', { label: 'La fecha' }),
  ...common,
];

const blockedDate = [
  body('cabin').exists({ values: 'falsy' }).withMessage('Elegí la cabaña').bail().isMongoId().withMessage('Cabaña inválida'),
  date('startDate', { required: true, label: 'La fecha desde' }),
  date('endDate', { required: true, label: 'La fecha hasta' }),
  body('endDate').custom((end, { req }) => {
    if (new Date(end) <= new Date(req.body.startDate)) throw new Error('La fecha hasta debe ser posterior a la fecha desde');
    return true;
  }),
  text('reason', { max: 120, label: 'El motivo' }),
];

module.exports = {
  service: { create: service(false), update: service(true) },
  attraction: { create: attraction(false), update: attraction(true) },
  faq: { create: faq(false), update: faq(true) },
  review: { create: review(false), update: review(true) },
  gallery: { upload: galleryUpload, update: galleryUpdate },
  nearbyPlace: { create: nearbyPlace(false), update: nearbyPlace(true) },
  specialEvent: { create: specialEvent(false), update: specialEvent(true) },
  reorder,
  feedback: { submit: feedbackSubmit, request: feedbackRequest },
  blockedDate,
};
