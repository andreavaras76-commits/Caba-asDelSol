/**
 * Espejo 1:1 de server/src/utils/constants.js (+ etiquetas en castellano para la UI).
 * Si cambiás algo allá, cambialo acá.
 */
export const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 80,
  TITLE_MAX: 120,
  SHORT_TEXT_MAX: 300,
  LONG_TEXT_MAX: 5000,
  PASSWORD_MIN: 8,
  GUESTS_MAX: 30,
  IMAGE_MAX_MB: 8,
};

export const AMENITIES = {
  wifi: { label: 'WiFi', icon: 'Wifi' },
  tv: { label: 'TV satelital', icon: 'Tv' },
  aire: { label: 'Aire acondicionado', icon: 'AirVent' },
  calefaccion: { label: 'Calefacción', icon: 'Heater' },
  hogar: { label: 'Hogar a leña', icon: 'Flame' },
  cocina: { label: 'Cocina equipada', icon: 'CookingPot' },
  heladera: { label: 'Heladera', icon: 'Refrigerator' },
  microondas: { label: 'Microondas', icon: 'Microwave' },
  parrilla: { label: 'Parrilla', icon: 'Beef' },
  vajilla: { label: 'Vajilla completa', icon: 'UtensilsCrossed' },
  ropa_cama: { label: 'Ropa de cama', icon: 'BedDouble' },
  toallas: { label: 'Toallas', icon: 'Bath' },
  mascotas: { label: 'Pet friendly', icon: 'PawPrint' },
  estacionamiento: { label: 'Estacionamiento', icon: 'Car' },
  vista_cerro: { label: 'Vista al cerro', icon: 'Mountain' },
  galeria: { label: 'Galería', icon: 'Armchair' },
};

export const BED_TYPES = {
  matrimonial: { label: 'Cama matrimonial', plural: 'Camas matrimoniales' },
  single: { label: 'Cama de una plaza', plural: 'Camas de una plaza' },
  cucheta: { label: 'Cucheta', plural: 'Cuchetas' },
  sofa_cama: { label: 'Sofá cama', plural: 'Sofás cama' },
};

export const PROMO_TYPES = {
  porcentaje: 'Porcentaje de descuento',
  precio_especial: 'Precio especial',
  noche_gratis: 'Noche gratis',
  texto: 'Texto libre',
};

export const SEASONS = {
  verano: 'Verano',
  invierno: 'Invierno',
  fines_largos: 'Fines de semana largos',
  todo_el_anio: 'Todo el año',
};

export const INQUIRY_TYPES = ['cabana', 'evento', 'promo', 'general'];

export const INQUIRY_STATUS = {
  nueva: 'Nueva',
  respondida: 'Respondida',
  reservo: 'Reservó',
  no_concreto: 'No concretó',
};

export const CLIENT_TAGS = {
  familia: 'Familia',
  pareja: 'Pareja',
  eventos: 'Eventos',
  mascota: 'Con mascota',
};

export const GALLERY_CATEGORIES = {
  cabanas: 'Cabañas',
  pileta: 'Pileta',
  quincho: 'Quincho',
  invierno: 'Invierno',
  entorno: 'Entorno',
};
