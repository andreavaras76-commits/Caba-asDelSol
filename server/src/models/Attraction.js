const { Schema, model } = require('mongoose');
const Image = require('./schemas/Image');

const attractionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    distance: { type: String, trim: true, default: '' },
    mapsUrl: { type: String, trim: true, default: '' },
    image: { type: Image, default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Attraction', attractionSchema);
