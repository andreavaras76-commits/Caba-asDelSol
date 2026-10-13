/**
 * Seed inicial: cuenta única de administración, configuración real del negocio, cabañas de ejemplo,
 * servicios, atractivos de Tafí y preguntas frecuentes.
 *
 * Es idempotente: no pisa datos existentes. Cada colección se carga sólo si está vacía.
 * Uso: npm run seed
 */
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Cabin = require('../models/Cabin');
const Service = require('../models/Service');
const Attraction = require('../models/Attraction');
const Faq = require('../models/Faq');

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
    threads: 'https://www.threads.net/@delsolcabanas',
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
      'Sólo un kilómetro separa el complejo de la Villa de Tafí: suficiente distancia para abstraerse de su bullicioso trajín, ' +
      'pero lo bastante cerca como para acceder fácilmente a todos sus servicios y atractivos.',
    stats: [
      { value: 1, suffix: 'km', label: 'de la Villa de Tafí' },
      { value: 30, suffix: '', label: 'personas en eventos' },
      { value: 2000, suffix: 'm', label: 'sobre el nivel del mar' },
    ],
  },
  events: {
    title: 'Eventos y días de campo',
    text:
      'Alquilamos el predio para cumpleaños y juntadas con amigos y amigas. Un día entero de sol, pileta y asado con los cerros de fondo, ' +
      'y si querés, te quedás a dormir.',
    capacity: 30,
    includes: ['Asador', 'Heladera', 'Quincho', 'Pileta', 'Mesas', 'Horno', 'Baño'],
    lodgingOptional: true,
  },
  showPrices: false,
  seo: {
    title: 'Cabañas del Sol — Tafí del Valle, Tucumán',
    description: 'Cabañas con pileta, quincho y desayuno a 1 km de la Villa de Tafí del Valle. Aceptamos mascotas. Consultá por WhatsApp.',
  },
};

// Cabañas DE EJEMPLO: reemplazar por las reales desde el panel
const cabinsData = [
  {
    name: 'Cabaña Sol Naciente',
    shortDescription: 'Ideal para parejas: hogar a leña y ventanal al cerro.',
    description:
      'Una cabaña íntima para despertar con la luz del amanecer sobre los cerros. Ambiente integrado con cocina equipada, hogar a leña y galería con vista.',
    capacity: 2,
    rooms: 1,
    bathrooms: 1,
    beds: [{ type: 'matrimonial', quantity: 1 }],
    amenities: ['wifi', 'tv', 'aire', 'hogar', 'cocina', 'heladera', 'ropa_cama', 'toallas', 'vista_cerro', 'galeria'],
    featured: true,
    order: 0,
  },
  {
    name: 'Cabaña El Pelado',
    shortDescription: 'Para familias: dos ambientes y parrilla propia.',
    description:
      'Amplia y luminosa, con dormitorio matrimonial, camas para los chicos, cocina completa y parrilla propia para las noches de asado.',
    capacity: 5,
    rooms: 2,
    bathrooms: 1,
    beds: [
      { type: 'matrimonial', quantity: 1 },
      { type: 'single', quantity: 1 },
      { type: 'cucheta', quantity: 1 },
    ],
    amenities: ['wifi', 'tv', 'aire', 'calefaccion', 'cocina', 'heladera', 'microondas', 'parrilla', 'vajilla', 'ropa_cama', 'toallas', 'mascotas', 'estacionamiento'],
    featured: true,
    order: 1,
  },
  {
    name: 'Cabaña La Angostura',
    shortDescription: 'La más grande: hasta 6 huéspedes, ideal para grupos.',
    description:
      'Pensada para grupos de amigos o familias grandes: dos dormitorios, living con hogar y una galería para las sobremesas largas mirando el valle.',
    capacity: 6,
    rooms: 3,
    bathrooms: 2,
    beds: [
      { type: 'matrimonial', quantity: 1 },
      { type: 'single', quantity: 2 },
      { type: 'sofa_cama', quantity: 1 },
    ],
    amenities: ['wifi', 'tv', 'aire', 'hogar', 'cocina', 'heladera', 'microondas', 'parrilla', 'vajilla', 'ropa_cama', 'toallas', 'mascotas', 'estacionamiento', 'galeria'],
    featured: false,
    order: 2,
  },
];

const servicesData = [
  { name: 'WiFi gratis', icon: 'Wifi' },
  { name: 'TV satelital', icon: 'Tv' },
  { name: 'Aceptamos mascotas', icon: 'PawPrint' },
  { name: 'Quincho', icon: 'Flame' },
  { name: 'Piletas', icon: 'Waves' },
  { name: 'Aire acondicionado', icon: 'AirVent' },
  { name: 'Desayuno', icon: 'Coffee' },
  { name: 'Lavandería', icon: 'WashingMachine' },
  { name: 'Estacionamiento', icon: 'Car' },
].map((s, order) => ({ ...s, order }));

// Distancias aproximadas: revisarlas desde el panel
const attractionsData = [
  {
    name: 'La Villa de Tafí',
    distance: '1 km',
    description: 'El centro de Tafí: artesanías, restaurantes, ferias y el paseo de la plaza, a minutos del complejo.',
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
    question: '¿Cuáles son los horarios de check-in y check-out?',
    answer: 'Coordinamos los horarios de ingreso y egreso al confirmar tu reserva. Escribinos por WhatsApp y lo acordamos según tu viaje.',
  },
  {
    question: '¿Puedo ir con mi mascota?',
    answer: 'Sí, aceptamos mascotas. Avisanos al hacer la consulta para prepararte la cabaña más cómoda para ustedes.',
  },
  {
    question: '¿Cómo confirmo la reserva? ¿Hay que dejar seña?',
    answer: 'Para confirmar la reserva se solicita una seña. Te pasamos el monto y los medios de pago por WhatsApp junto con la disponibilidad.',
  },
  {
    question: '¿El desayuno está incluido?',
    answer: 'Ofrecemos servicio de desayuno. Consultanos las condiciones para tu estadía.',
  },
  {
    question: '¿Qué tan lejos queda de la Villa?',
    answer: 'Sólo un kilómetro: lo bastante lejos para descansar en calma y lo bastante cerca para disfrutar de todos los servicios y atractivos de Tafí.',
  },
  {
    question: '¿Puedo alquilar el predio para un cumpleaños o una juntada?',
    answer: 'Sí. Alquilamos el predio para días de campo de hasta 30 personas, con asador, quincho, pileta, mesas, horno, heladera y baño. El hospedaje es opcional.',
  },
].map((f, order) => ({ ...f, order }));

async function seedIfEmpty(Model, data, label) {
  if (await Model.estimatedDocumentCount()) {
    console.log(`•  ${label}: ya hay datos, se omite`);
    return;
  }
  // create (no insertMany) para que corran los hooks y validaciones
  for (const doc of data) await Model.create(doc); // eslint-disable-line no-await-in-loop
  console.log(`✓  ${label}: ${data.length} cargados`);
}

async function run() {
  await connectDB();
  console.log(`\n🌄 Seed de Cabañas del Sol → ${mongoose.connection.name}\n`);

  // Cuenta única de administración (sólo si todavía no hay ninguna)
  const username = (process.env.SEED_ADMIN_USERNAME || '').trim().normalize('NFC').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!username || !password) throw new Error('Definí SEED_ADMIN_USERNAME y SEED_ADMIN_PASSWORD en el .env');
  if (await User.estimatedDocumentCount()) {
    console.log('•  Cuenta de administración: ya existe, se omite');
  } else {
    await User.create({ name: process.env.SEED_ADMIN_NAME || 'Administración', username, password, role: 'admin' });
    console.log(`✓  Cuenta de administración creada: ${username}`);
  }

  // Configuración
  if (await Settings.exists({ key: 'main' })) console.log('•  Configuración: ya existe, se omite');
  else {
    await Settings.create(settingsData);
    console.log('✓  Configuración general cargada con los datos reales');
  }

  const slugify = require('./slugify');
  await seedIfEmpty(Cabin, cabinsData.map((c) => ({ ...c, slug: slugify(c.name) })), 'Cabañas de ejemplo');
  await seedIfEmpty(Service, servicesData, 'Servicios');
  await seedIfEmpty(Attraction, attractionsData, 'Atractivos de Tafí');
  await seedIfEmpty(Faq, faqsData, 'Preguntas frecuentes');

  console.log('\n☀️  Seed terminado.\n');
}

run()
  .catch((err) => {
    console.error('❌ Error en el seed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

