const { body } = require('express-validator');
const { text, bool, int, number, arrayOf, mongoIdArray } = require('./common');
const { AMENITIES, BED_TYPES, BED_LOCATIONS, CABIN_TYPES, SLEEPING_OPTIONS, LIMITS } = require('../utils/constants');

const cabin = (partial = false) => [
  text('name', { required: true, min: 2, max: LIMITS.NAME_MAX, label: 'El nombre', partial }),
  body('slug')
    .optional({ values: 'falsy' })
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('El slug sólo admite minúsculas, números y guiones'),
  text('shortDescription', { max: LIMITS.SHORT_TEXT_MAX, label: 'La descripción corta' }),
  text('description', { max: LIMITS.LONG_TEXT_MAX, label: 'La descripción' }),
  int('capacity', { min: 1, max: LIMITS.GUESTS_MAX, required: true, label: 'La capacidad', partial }),
  int('rooms', { min: 1, max: 20, label: 'Los ambientes' }),
  int('bathrooms', { min: 0, max: 10, label: 'Los baños' }),
  body('beds').optional().isArray({ max: 10 }).withMessage('Las camas deben ser una lista (máx. 10)'),
  body('beds.*.type').isIn(BED_TYPES).withMessage('Tipo de cama no válido'),
  body('beds.*.quantity').isInt({ min: 1, max: 10 }).withMessage('La cantidad de camas debe ser entre 1 y 10').toInt(),
  body('beds.*.location').isIn(BED_LOCATIONS).withMessage('El ambiente de la cama no es válido'),
  body('type').optional().isIn(CABIN_TYPES).withMessage('El tipo de cabaña no es válido'),
  bool('privateBathroom', 'Baño privado'),
  bool('electricWaterHeater', 'Termotanque eléctrico'),
  ...arrayOf('sleepingOptions', SLEEPING_OPTIONS, 'Las opciones de cama'),
  ...arrayOf('amenities', AMENITIES, 'Los amenities'),
  number('price.amount', { min: 0, max: 100000000, label: 'El precio' }),
  bool('price.show', 'Mostrar precio'),
  bool('featured', 'Destacada'),
  bool('active', 'Activa'),
  int('order', { min: 0, max: 9999, label: 'El orden' }),
];

const reorderImages = [
  ...mongoIdArray('imageIds', 'Las imágenes'),
  body('imageIds').exists().withMessage('Enviá el nuevo orden de imágenes'),
  body('coverImageId').optional({ values: 'null' }).isMongoId().withMessage('Portada inválida'),
];

const updateImage = [text('alt', { max: 160, label: 'El texto alternativo' })];

module.exports = { create: cabin(false), update: cabin(true), reorderImages, updateImage };
