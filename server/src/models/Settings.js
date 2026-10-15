const { Schema, model } = require('mongoose');
const Image = require('./schemas/Image');

const statSchema = new Schema({ value: Number, suffix: String, label: String }, { _id: false });

const settingsSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true, immutable: true },

    businessName: { type: String, trim: true, default: 'Cabañas del Sol' },
    location: { type: String, trim: true, default: 'Tafí del Valle' },
    slogan: { type: String, trim: true, default: '' },

    contact: {
      whatsapp: { type: String, trim: true, default: '' },
      phoneDisplay: { type: String, trim: true, default: '' },
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
      mapsUrl: { type: String, trim: true, default: '' },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    hero: {
      title: { type: String, trim: true, default: '' },
      subtitle: { type: String, trim: true, default: '' },
      imagesVerano: [Image],
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
          icon: { type: String, trim: true, default: 'Sparkles' },
          badge: { type: String, trim: true, default: '' },
        },
      ],
      minHours: { type: Number, default: 3 },
      schedule: { type: String, trim: true, default: 'A consultar' },
      lodgingOptional: { type: Boolean, default: true },
      images: [Image],
    },

    showPrices: { type: Boolean, default: false },
    seo: {
      title: { type: String, trim: true, default: '' },
      description: { type: String, trim: true, default: '' },
      ogImage: { type: Image, default: null },
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function getSingleton() {
  return (await this.findOne({ key: 'main' })) || this.create({ key: 'main' });
};

module.exports = model('Settings', settingsSchema);
