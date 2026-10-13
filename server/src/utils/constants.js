/**
 * Enumeraciones y límites compartidos por modelos y validadores.
 * IMPORTANTE: se replican 1:1 en client/src/utils/constants.js para los esquemas Zod.
 */
module.exports = {
  ROLES: ['admin'], // una sola cuenta con acceso total

  AMENITIES: [
    'wifi',
    'tv',
    'aire',
    'calefaccion',
    'hogar',
    'cocina',
    'heladera',
    'microondas',
    'parrilla',
    'vajilla',
    'ropa_cama',
    'toallas',
    'mascotas',
    'estacionamiento',
    'vista_cerro',
    'galeria',
  ],
  BED_TYPES: ['matrimonial', 'single', 'cucheta', 'sofa_cama'],

  PROMO_TYPES: ['porcentaje', 'precio_especial', 'noche_gratis', 'texto'],
  SEASONS: ['verano', 'invierno', 'fines_largos', 'todo_el_anio'],

  INQUIRY_TYPES: ['cabana', 'evento', 'promo', 'general'],
  INQUIRY_STATUS: ['nueva', 'respondida', 'reservo', 'no_concreto'],

  CLIENT_TAGS: ['familia', 'pareja', 'eventos', 'mascota'],

  GALLERY_CATEGORIES: ['cabanas', 'pileta', 'quincho', 'invierno', 'entorno'],

  SETTINGS_IMAGE_GROUPS: ['heroVerano', 'heroInvierno', 'about', 'events', 'og'],

  LIMITS: {
    NAME_MIN: 2,
    NAME_MAX: 80,
    TITLE_MAX: 120,
    SHORT_TEXT_MAX: 300,
    LONG_TEXT_MAX: 5000,
    PASSWORD_MIN: 8,
    GUESTS_MAX: 30, // tope absoluto (eventos)
    PHONE_MIN: 8,
    PHONE_MAX: 20,
    IMAGE_MAX_MB: 8,
  },
};
