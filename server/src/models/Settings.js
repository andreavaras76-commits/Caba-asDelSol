const { Schema, model } = require('mongoose');
const Image = require('./schemas/Image');

const statSchema = new Schema({ value: Number, suffix: String, label: String }, { _id: false }); // value admite decimales (1,5 km)

/** Documento único con toda la configuración editable del sitio */
const settingsSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },

    businessName: { type: String, trim: true, default: 'Cabañas del Sol' },
    location: { type: String, trim: true, default: 'Tafí del Valle' },
    slogan: { type: String, trim: true, default: '' },

    contact: {
      whatsapp: { type: String, trim: true, default: '' }, // formato wa.me: 5493815027738
      phoneDisplay: { type: String, trim: true, default: '' }, // (0381) 15-502-7738
      email: { type: String, trim: true, default: '' },
      website: { type: String, trim: true, default: '' },
    },
    social: {
      instagram: { type: String, trim: true, default: '' },
      threads: { type: String, trim: true, default: '' },
      facebook: { type: String, trim: true, default: '' },
    },
    address: {
      street: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
      province: { type: String, trim: true, default: '' },
      country: { type: String, trim: true, default: 'Argentina' },
      mapsUrl: { type: String, trim: true, default: '' }, // botón "Cómo llegar"
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    hero: {
      title: { type: String, trim: true, default: '' },
      subtitle: { type: String, trim: true, default: '' },
      imagesVerano: [Image],
      imagesInvierno: [Image],
    },
    about: {
      title: { type: String, trim: true, default: '' },
      text: { type: String, trim: true, default: '' },
      images: [Image],
      stats: [statSchema],
    },
    events: {
      title: { type: String, trim: true, default: '' },
      text: { type: String, trim: true, default: '' },
      capacity: { type: Number, default: 30 },
      includes: [
        {
          _id: false,
          label: { type: String, trim: true, required: true },
          icon: { type: String, trim: true, default: 'Sparkles' }, // nombre de ícono de Lucide
          badge: { type: String, trim: true, default: '' }, // ej: "Solo verano"
        },
      ],
      minHours: { type: Number, default: 3 },
      schedule: { type: String, trim: true, default: 'A consultar' },
      lodgingOptional: { type: Boolean, default: true },
      images: [Image],
    },

    showPrices: { type: Boolean, default: false }, // interruptor global de precios
    seo: {
      title: { type: String, trim: true, default: '' },
      description: { type: String, trim: true, default: '' },
      ogImage: { type: Image, default: null },
    },
  },
  { timestamps: true }
);

/** Devuelve el documento único, creándolo si no existe */
settingsSchema.statics.getSingleton = async function getSingleton() {
  return (await this.findOne({ key: 'main' })) || this.create({ key: 'main' });
};

module.exports = model('Settings', settingsSchema);
