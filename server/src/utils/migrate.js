const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Settings = require('../models/Settings');
const Cabin = require('../models/Cabin');
const Service = require('../models/Service');
const Attraction = require('../models/Attraction');
const Faq = require('../models/Faq');
const NearbyPlace = require('../models/NearbyPlace');
const SpecialEvent = require('../models/SpecialEvent');
const data = require('./seedData');

const OLD_EXAMPLES = ['cabana-sol-naciente', 'cabana-el-pelado', 'cabana-la-angostura'];
const OLD_BED = { single: 'individual', cucheta: 'marinera', sofa_cama: 'divan_cama' };

const log = (msg) => console.log(`  ${msg}`);

async function migrateCabins() {
  const db = mongoose.connection.collection('cabins');
  const existing = await db.find().toArray();

  const examples = existing.filter((c) => OLD_EXAMPLES.includes(c.slug) && !(c.images || []).length);
  if (examples.length) {
    await db.deleteMany({ _id: { $in: examples.map((c) => c._id) } });
    log(`✓ ${examples.length} cabañas de ejemplo eliminadas`);
  }

  for (const cabin of data.cabinsData) {
    const found = await Cabin.findOne({ $or: [{ slug: cabin.slug }, { name: cabin.name }] });
    if (found) {
      found.set({
        type: cabin.type,
        beds: cabin.beds,
        sleepingOptions: found.sleepingOptions?.length ? found.sleepingOptions : cabin.sleepingOptions,
        privateBathroom: true,
        electricWaterHeater: true,
      });
      await found.save();
      log(`• ${cabin.name}: distribución actualizada (fotos conservadas)`);
    } else {
      await Cabin.create(cabin);
      log(`✓ ${cabin.name} creada`);
    }
  }

  const rest = await db.find({ 'beds.type': { $in: Object.keys(OLD_BED) } }).toArray();
  for (const c of rest) {
    const beds = c.beds.map((b) => ({ ...b, type: OLD_BED[b.type] || b.type, location: b.location || 'dormitorio' }));
    await db.updateOne({ _id: c._id }, { $set: { beds, privateBathroom: c.privateBathroom ?? true, electricWaterHeater: c.electricWaterHeater ?? true } });
  }
  if (rest.length) log(`✓ ${rest.length} cabañas pasadas al nuevo formato de camas`);
}

async function migrateSettings() {
  const s = await Settings.findOne({ key: 'main' });
  if (!s) return;
  const d = data.settingsData;

  if (/un kilómetro|1 km/i.test(s.about?.text || '')) s.about.text = d.about.text;
  if (!s.about.stats?.length || s.about.stats.some((st) => st.suffix === 'km' && st.value === 1)) s.about.stats = d.about.stats;
  if (/1 km/i.test(s.seo?.description || '')) s.seo.description = d.seo.description;
  s.address.postalCode = '4137';
  s.social.threads = '';

  const raw = await mongoose.connection.collection('settings').findOne({ key: 'main' }, { projection: { 'events.includes': 1 } });
  const oldIncludes = raw?.events?.includes || [];
  if (!oldIncludes.length || typeof oldIncludes[0] === 'string') s.events.includes = d.events.includes;
  s.events.minHours = s.events.minHours || d.events.minHours;
  s.events.schedule = s.events.schedule || d.events.schedule;
  if (/pileta y asado/.test(s.events.text || '')) s.events.text = d.events.text;

  await s.save();
  log('✓ Configuración: distancias, contadores, SEO y eventos actualizados');
}

async function migrateContent() {
  await Faq.deleteMany({});
  await Faq.insertMany(data.faqsData);
  log(`✓ ${data.faqsData.length} preguntas frecuentes cargadas`);

  await Service.updateOne({ name: 'Desayuno' }, { $set: { name: 'Desayuno (amenities)' } });
  const names = (await Service.find().lean()).map((x) => x.name);
  let added = 0;
  for (const srv of data.servicesData) {
    if (!names.includes(srv.name)) {
      await Service.create({ ...srv, order: 100 + srv.order });
      added++;
    }
  }
  for (const srv of data.servicesData) await Service.updateOne({ name: srv.name }, { $set: { order: srv.order } });
  log(`✓ Servicios: ${added} agregados (baño privado, termotanque…) y reordenados`);

  await mongoose.connection.collection('galleryimages').updateMany({ category: 'invierno' }, { $set: { category: 'entorno' } });

  await mongoose.connection.collection('reviews').updateMany({ kind: { $exists: false } }, { $set: { kind: 'manual', status: 'respondida' } });

  await Attraction.updateOne({ name: 'La Villa de Tafí', distance: '1 km' }, { $set: { distance: '1,5 km · menos de 5 min' } });

  const placeholders = await NearbyPlace.deleteMany({ name: /\(completar/ });
  const existingNames = (await NearbyPlace.find().lean()).map((p) => `${p.category}|${p.name}`);
  const seen = {};
  const toAdd = data.nearbyPlacesData.filter((p) => {
    const k = `${p.category}|${p.name}`;
    seen[k] = (seen[k] || 0) + 1;
    return existingNames.filter((e) => e === k).length < seen[k];
  });
  if (toAdd.length) await NearbyPlace.insertMany(toAdd);
  log(`✓ Lugares cercanos: ${placeholders.deletedCount} provisorios reemplazados, ${toAdd.length} agregados`);

  const amenitiesByNumber = Object.fromEntries(data.cabinsData.map((c) => [c.slug, c.amenities]));
  for (const [slug, amenities] of Object.entries(amenitiesByNumber)) {
    await Cabin.updateOne({ slug }, { $set: { amenities } });
  }
  log('✓ Comodidades actualizadas (sin hogar; con microondas y pava; galería salvo la 6)');

  await Service.updateMany({ group: { $exists: false } }, { $set: { group: 'servicio' } });
  if (!(await SpecialEvent.estimatedDocumentCount())) {
    await SpecialEvent.insertMany(data.specialEventsData);
    log('✓ Eventos especiales: Navidad y Año Nuevo');
  }
}

async function run() {
  await connectDB();
  console.log(`\n🔧 Migración → ${mongoose.connection.name}\n`);
  await migrateCabins();
  await migrateSettings();
  await migrateContent();
  console.log('\n✅ Migración terminada.\n');
}

run()
  .catch((err) => {
    console.error('❌ Error en la migración:', err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
