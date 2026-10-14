const { Schema, model } = require('mongoose');
const Image = require('./schemas/Image');

/** Eventos especiales de temporada (Navidad, Año Nuevo…): se activan o desactivan cada año */
const specialEventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    date: { type: Date, default: null },
    image: { type: Image, default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('SpecialEvent', specialEventSchema);
