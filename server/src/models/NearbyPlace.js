const { Schema, model } = require('mongoose');
const Image = require('./schemas/Image');
const { NEARBY_CATEGORIES } = require('../utils/constants');

/** "Todo cerca tuyo": servicios y lugares cercanos con teléfono (delivery, súper, estación, etc.) */
const nearbyPlaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: NEARBY_CATEGORIES, required: true },
    description: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' }, // para "Llamar" (tel:)
    whatsapp: { type: String, trim: true, default: '' }, // formato wa.me, opcional
    address: { type: String, trim: true, default: '' }, // dirección o referencia
    mapsUrl: { type: String, trim: true, default: '' },
    image: { type: Image, default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

nearbyPlaceSchema.index({ active: 1, category: 1, order: 1 });

module.exports = model('NearbyPlace', nearbyPlaceSchema);
