const { Schema, model } = require('mongoose');
const Image = require('./schemas/Image');
const { NEARBY_CATEGORIES } = require('../utils/constants');

const nearbyPlaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: NEARBY_CATEGORIES, required: true },
    description: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    whatsapp: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    mapsUrl: { type: String, trim: true, default: '' },
    image: { type: Image, default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

nearbyPlaceSchema.index({ active: 1, category: 1, order: 1 });

module.exports = model('NearbyPlace', nearbyPlaceSchema);
