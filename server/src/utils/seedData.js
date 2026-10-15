const MAPS_URL = 'https://maps.app.goo.gl/2kcL473RB16yd4FR9';
const mapsSearch = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

const settingsData = {
  key: 'main',
  businessName: 'Cabañas del Sol',
  location: 'Tafí del Valle',
  slogan: 'En las coordenadas ideales para disfrutar de la placidez y el esparcimiento en los Valles.',
  contact: {
    whatsapp: '5493815027738',
    phoneDisplay: '(0381) 15-502-7738',
    email: '',
    website: 'https://delsoltafidelvalle.com.ar',
  },
  social: {
    instagram: 'https://www.instagram.com/delsolcabanas',
    facebook: '',
  },
  address: {
    street: 'Ruta 307 – Km 60, por calle Rosendo Contreras (al final)',
    city: 'Tafí del Valle',
    postalCode: '4137',
    province: 'Tucumán',
    country: 'Argentina',
    mapsUrl: MAPS_URL,
    lat: -26.8596544,
    lng: -65.6869324,
  },
  hero: {
    title: 'Amanece en los Valles',
    subtitle: 'En las coordenadas ideales para disfrutar de la placidez y el esparcimiento en los Valles.',
  },
  about: {
    title: 'El complejo',
    text:
      'Cabañas del Sol es un complejo diseñado para ofrecer todas las comodidades, el mejor servicio y la más cordial atención a sus huéspedes. ' +
      'Estamos a 1,5 km de la Villa de Tafí, a menos de 5 minutos en auto: suficiente distancia para abstraerse de su bullicioso trajín, ' +
      'pero lo bastante cerca como para acceder fácilmente a todos sus servicios y atractivos.',
    stats: [
      { value: 1.5, suffix: 'km', label: 'de la Villa de Tafí' },
      { value: 5, suffix: 'min', label: 'en auto a la Villa' },
      { value: 30, suffix: '', label: 'personas en eventos' },
    ],
  },
  events: {
    title: 'Eventos y días de campo',
    text:
      'Alquilamos el espacio para cumpleaños y juntadas con amigos y amigas. Un día de sol, asado y sobremesa con los cerros de fondo, ' +
      'y si querés, te quedás a dormir.',
    capacity: 30,
    minHours: 3,
    schedule: 'A consultar',
    lodgingOptional: true,
    includes: [
      { label: 'Sala de estar', icon: 'Sofa', badge: '' },
      { label: 'Sillas', icon: 'Armchair', badge: '' },
      { label: 'Mesas', icon: 'Utensils', badge: '' },
      { label: 'Vajilla', icon: 'UtensilsCrossed', badge: '' },
      { label: 'Mantelería', icon: 'Layers', badge: '' },
      { label: 'Quincho', icon: 'Tent', badge: '' },
      { label: 'Asador', icon: 'Flame', badge: '' },
      { label: 'Horno', icon: 'CookingPot', badge: '' },
      { label: 'Heladera', icon: 'Refrigerator', badge: '' },
      { label: 'Baño', icon: 'Bath', badge: '' },
      { label: 'Pileta', icon: 'Waves', badge: 'Solo verano' },
    ],
  },
  showPrices: false,
  seo: {
    title: 'Cabañas del Sol — Tafí del Valle, Tucumán',
    description: 'Cabañas con baño privado, pileta y quincho a 1,5 km de la Villa de Tafí (menos de 5 min en auto). Aceptamos mascotas.',
  },
};

const amenitiesFor = (n) => [
  'wifi',
  'tv',
  'aire',
  'cocina',
  'microondas',
  'pava',
  'heladera',
  'vajilla',
  'ropa_cama',
  'toallas',
  'mascotas',
  'estacionamiento',
  ...(n === 6 ? [] : ['galeria']),
];

const dormitorio = (n) => ({
  name: `Cabaña ${n}`,
  slug: `cabana-${n}`,
  type: 'dormitorio',
  shortDescription: 'Para 1 a 4 personas: dormitorio con cama matrimonial y cocina comedor con cama marinera.',
  description:
    'Un dormitorio con cama matrimonial y una cocina comedor con cama marinera, ideal para parejas o familias de hasta 4 personas. ' +
    'Tiene baño privado y termotanque eléctrico: todo es individual, sólo se comparten los espacios comunes del complejo.',
  capacity: 4,
  rooms: 2,
  bathrooms: 1,
  beds: [
    { type: 'matrimonial', quantity: 1, location: 'dormitorio' },
    { type: 'marinera', quantity: 1, location: 'cocina_comedor' },
  ],
  sleepingOptions: ['matrimonial', 'individuales'],
  privateBathroom: true,
  electricWaterHeater: true,
  amenities: amenitiesFor(n),
  featured: n === 1,
  order: n - 1,
});

const monoambiente = (n) => ({
  name: `Cabaña ${n}`,
  slug: `cabana-${n}`,
  type: 'monoambiente',
  shortDescription: 'Monoambiente con diván cama, baño privado y termotanque eléctrico.',
  description:
    'Un monoambiente cómodo y luminoso con diván cama. Tiene baño privado y termotanque eléctrico: ' +
    'todo es individual, sólo se comparten los espacios comunes del complejo.',
  capacity: 2,
  rooms: 1,
  bathrooms: 1,
  beds: [{ type: 'divan_cama', quantity: 1, location: 'monoambiente' }],
  sleepingOptions: ['matrimonial', 'individuales'],
  privateBathroom: true,
  electricWaterHeater: true,
  amenities: amenitiesFor(n),
  featured: false,
  order: n - 1,
});

const cabinsData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => (n === 5 || n === 6 ? monoambiente(n) : dormitorio(n)));

const servicesData = [
  { name: 'WiFi gratis', icon: 'Wifi' },
  { name: 'TV satelital', icon: 'Tv' },
  { name: 'Aire acondicionado frío/calor', icon: 'AirVent' },
  { name: 'Quincho', icon: 'Flame' },
  { name: 'Piletas', icon: 'Waves' },
  { name: 'Desayuno (amenities)', icon: 'Coffee' },
  { name: 'Lavandería', icon: 'WashingMachine' },
  { name: 'Estacionamiento', icon: 'Car' },
  { name: 'Aceptamos mascotas', icon: 'PawPrint' },
  { name: 'Baño privado', icon: 'Bath' },
  { name: 'Termotanque eléctrico', icon: 'ShowerHead' },
  { name: 'Asadores', icon: 'Flame', group: 'espacio', description: 'Para los asados de cada día.' },
  { name: 'Pileta para niños y para adultos', icon: 'Waves', group: 'espacio', description: 'Dos piletas: una para los más chicos y otra para adultos.' },
  { name: 'Sala de estar', icon: 'Sofa', group: 'espacio', description: 'Un espacio común para compartir.' },
].map((s, order) => ({ group: 'servicio', ...s, order }));

const attractionsData = [
  {
    name: 'La Villa de Tafí',
    distance: '1,5 km · menos de 5 min',
    description: 'El centro de Tafí: artesanías, restaurantes, ferias y el paseo de la plaza.',
    mapsUrl: mapsSearch('Tafí del Valle, Tucumán'),
  },
  {
    name: 'Dique La Angostura',
    distance: '≈ 15 min en auto',
    description: 'El espejo de agua del valle: kayak, windsurf, pesca y atardeceres frente a los cerros.',
    mapsUrl: mapsSearch('Dique La Angostura, Tafí del Valle'),
  },
  {
    name: 'Parque de los Menhires',
    distance: '≈ 20 min en auto',
    description: 'Monolitos de piedra tallados hace más de 2000 años por la cultura Tafí, en El Mollar.',
    mapsUrl: mapsSearch('Parque de los Menhires, El Mollar, Tucumán'),
  },
  {
    name: 'Cerro El Pelado',
    distance: 'Trekking',
    description: 'Una caminata clásica con la mejor vista panorámica del valle y del dique.',
    mapsUrl: mapsSearch('Cerro El Pelado, Tafí del Valle'),
  },
  {
    name: 'Quesos tafinos',
    distance: 'En el valle',
    description: 'Visitá las queserías artesanales y probá el famoso queso de Tafí, con tradición desde la época jesuítica.',
    mapsUrl: mapsSearch('Queso de Tafí del Valle'),
  },
  {
    name: 'Capilla Jesuítica de La Banda',
    distance: '≈ 5 min en auto',
    description: 'Conjunto jesuítico del siglo XVIII, hoy museo, rodeado de arboledas y senderos.',
    mapsUrl: mapsSearch('Capilla Jesuítica La Banda, Tafí del Valle'),
  },
].map((a, order) => ({ ...a, order }));

const faqsData = [
  {
    question: '¿Cuál es el horario de check-in y check-out?',
    answer: 'Check-in: temporada alta desde las 13:00 hs, temporada baja desde las 11:00 hs. Check-out: en temporada alta y baja, de 10:00 a 10:30 hs.',
  },
  {
    question: '¿Puedo hacer late check-out?',
    answer: 'Fuera de temporada podés quedarte hasta las 18:30 hs con una tarifa extra de check-out. Consultanos por WhatsApp.',
  },
  {
    question: '¿Qué incluye el desayuno?',
    answer: 'Te dejamos amenities para el desayuno: té, café, mate e infusiones. Las facturas son opcionales y tienen un costo extra.',
  },
  {
    question: '¿Están lejos de la Villa?',
    answer: 'No, estamos a 1,5 km de la Villa de Tafí, a menos de 5 minutos en auto. Lo justo para descansar tranquilo y tener todo cerca.',
  },
  {
    question: '¿Puedo festejar un cumpleaños o hacer una juntada?',
    answer:
      '¡Sí! Alquilamos el espacio para cumpleaños y juntadas de hasta 30 personas, con un mínimo de 3 horas. Incluye sala de estar, sillas, vajilla, ' +
      'mantelería, quincho, asador, heladera, horno, mesas, baño y pileta (solo en verano). Los horarios son a consultar.',
  },
  {
    question: '¿Las cabañas tienen baño privado?',
    answer: 'Sí, cada cabaña tiene su propio baño y termotanque eléctrico. Todo es individual; solo se comparten los espacios comunes del complejo.',
  },
  {
    question: '¿Qué servicios tiene el complejo?',
    answer:
      'WiFi gratis, TV satelital, aire acondicionado, quincho, piletas, desayuno (amenities), lavandería y estacionamiento. Aceptamos mascotas.',
  },
].map((f, order) => ({ ...f, order }));

const nearbyPlacesData = [
  { name: 'Delivery de comida', category: 'delivery', description: 'Comida a domicilio en la zona.' },
  { name: 'Delivery de comida', category: 'delivery', description: 'Otra opción de comida a domicilio.' },
  { name: 'Delivery de comida', category: 'delivery', description: 'Pedidos para comer en la cabaña.' },
  {
    name: 'Súper Kilómetro 60',
    category: 'supermercado',
    description: 'Supermercado sobre la Ruta 307, cerca del complejo.',
    address: 'Ruta 307 – Km 60',
    mapsUrl: mapsSearch('Supermercado Kilómetro 60, Tafí del Valle'),
  },
  {
    name: 'Estación de servicio Shell',
    category: 'estacion_servicio',
    description: 'Combustible y tienda: se puede pedir comida, bebida y almacén.',
    mapsUrl: mapsSearch('Shell Tafí del Valle'),
  },
  { name: 'Carnicería con envío a domicilio', category: 'carniceria', description: 'Te lleva el pedido hasta la cabaña.' },
  { name: 'Panadería', category: 'panaderia', description: 'Pan y facturas frescas.' },
  { name: 'Tortas por encargo', category: 'tortas', description: 'Tortas para cumpleaños y festejos.' },
  { name: 'Paseos, entretenimiento y salidas', category: 'paseos', description: 'Excursiones, cabalgatas y salidas por el valle.' },
].map((p, order) => ({ phone: '', whatsapp: '', address: '', mapsUrl: '', active: true, ...p, order }));

const nextDate = (month, day) => {
  const now = new Date();
  const y = new Date(now.getFullYear(), month - 1, day) < now ? now.getFullYear() + 1 : now.getFullYear();
  return new Date(Date.UTC(y, month - 1, day, 12));
};

const specialEventsData = [
  {
    title: 'Fiesta de Navidad',
    description: 'Celebrá Nochebuena en el valle: quincho, mesa larga y los cerros de fondo. Reservá el espacio para tu familia o tus amigos.',
    date: nextDate(12, 24),
    active: true,
    order: 0,
  },
  {
    title: 'Fiesta de Año Nuevo',
    description: 'Recibí el año bajo el cielo de Tafí: espacio para tu festejo, con opción de quedarte a dormir en las cabañas.',
    date: nextDate(12, 31),
    active: true,
    order: 1,
  },
];

module.exports = {
  settingsData,
  cabinsData,
  servicesData,
  attractionsData,
  faqsData,
  nearbyPlacesData,
  specialEventsData,
};
