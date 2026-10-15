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
  aire: { label: 'Aire acondicionado frío/calor', icon: 'AirVent' },
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
  pava: { label: 'Pava eléctrica', icon: 'Coffee' },
};

export const BED_TYPES = {
  matrimonial: { label: 'cama matrimonial', plural: 'camas matrimoniales', icon: 'BedDouble' },
  individual: { label: 'cama individual', plural: 'camas individuales', icon: 'BedSingle' },
  marinera: { label: 'cama marinera', plural: 'camas marineras', icon: 'Layers' },
  divan_cama: { label: 'diván cama', plural: 'divanes cama', icon: 'Sofa' },
};

export const BED_LOCATIONS = {
  dormitorio: 'Dormitorio',
  cocina_comedor: 'Cocina comedor',
  monoambiente: 'Monoambiente',
};

export const CABIN_TYPES = {
  dormitorio: 'Dormitorio + cocina comedor',
  monoambiente: 'Monoambiente',
};

export const SLEEPING_OPTIONS = {
  matrimonial: 'Cama matrimonial',
  individuales: 'Camas individuales',
};

export const NEARBY_CATEGORIES = {
  delivery: { label: 'Delivery de comida', short: 'Delivery', icon: 'Bike' },
  supermercado: { label: 'Supermercado', short: 'Súper', icon: 'ShoppingCart' },
  estacion_servicio: { label: 'Estación de servicio', short: 'Estación', icon: 'Fuel' },
  carniceria: { label: 'Carnicería', short: 'Carnicería', icon: 'Beef' },
  panaderia: { label: 'Panadería', short: 'Panadería', icon: 'Croissant' },
  tortas: { label: 'Tortas', short: 'Tortas', icon: 'CakeSlice' },
  paseos: { label: 'Paseos y salidas', short: 'Paseos', icon: 'Compass' },
};

export const SERVICE_GROUPS = { servicio: 'Servicio del complejo', espacio: 'Espacio común del predio' };

export const EVENT_TYPES = ['Cumpleaños', 'Juntada', 'Navidad', 'Año Nuevo', 'Otro'];
export const EVENT_MIN_HOURS = 3;

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
  habitaciones: 'Habitaciones',
  pileta: 'Pileta',
  quincho: 'Quincho',
  sala_estar: 'Sala de estar',
  estacionamiento: 'Estacionamiento',
  entorno: 'Entorno',
};
