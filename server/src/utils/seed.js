const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Cabin = require('../models/Cabin');
const Service = require('../models/Service');
const Attraction = require('../models/Attraction');
const Faq = require('../models/Faq');
const NearbyPlace = require('../models/NearbyPlace');
const SpecialEvent = require('../models/SpecialEvent');
const data = require('./seedData');

async function seedIfEmpty(Model, docs, label) {
  if (await Model.estimatedDocumentCount()) {
    console.log(`•  ${label}: ya hay datos, se omite`);
    return;
  }
  for (const doc of docs) await Model.create(doc);
  console.log(`✓  ${label}: ${docs.length} cargados`);
}

async function run() {
  await connectDB();
  console.log(`\n🌄 Seed de Cabañas del Sol → ${mongoose.connection.name}\n`);

  const username = (process.env.SEED_ADMIN_USERNAME || '').trim().normalize('NFC').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!username || !password) throw new Error('Definí SEED_ADMIN_USERNAME y SEED_ADMIN_PASSWORD en el .env');
  if (await User.estimatedDocumentCount()) {
    console.log('•  Cuenta de administración: ya existe, se omite');
  } else {
    await User.create({ name: process.env.SEED_ADMIN_NAME || 'Administración', username, password, role: 'admin' });
    console.log(`✓  Cuenta de administración creada: ${username}`);
  }

  if (await Settings.exists({ key: 'main' })) console.log('•  Configuración: ya existe, se omite');
  else {
    await Settings.create(data.settingsData);
    console.log('✓  Configuración general cargada con los datos reales');
  }

  await seedIfEmpty(Cabin, data.cabinsData, 'Cabañas');
  await seedIfEmpty(Service, data.servicesData, 'Servicios');
  await seedIfEmpty(Attraction, data.attractionsData, 'Atractivos de Tafí');
  await seedIfEmpty(Faq, data.faqsData, 'Preguntas frecuentes');
  await seedIfEmpty(NearbyPlace, data.nearbyPlacesData, 'Lugares cercanos');
  await seedIfEmpty(SpecialEvent, data.specialEventsData, 'Eventos especiales');

  console.log('\n☀️  Seed terminado.\n');
}

run()
  .catch((err) => {
    console.error('❌ Error en el seed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
