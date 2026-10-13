const { Schema, model } = require('mongoose');
const Image = require('./schemas/Image');
const { AMENITIES, BED_TYPES } = require('../utils/constants');

const cabinSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    capacity: { type: Number, required: true, min: 1 },
    rooms: { type: Number, default: 1, min: 1 }, // ambientes
    bathrooms: { type: Number, default: 1, min: 0 },
    beds: [
      {
        _id: false,
        type: { type: String, enum: BED_TYPES, required: true },
        quantity: { type: Number, min: 1, default: 1 },
      },
    ],
    amenities: [{ type: String, enum: AMENITIES }],
    price: {
      amount: { type: Number, min: 0, default: null }, // precio de referencia por noche
      show: { type: Boolean, default: false },
    },
    images: [Image], // el orden del array es el orden de la galería
    coverImageId: { type: Schema.Types.ObjectId, default: null }, // _id de una de images
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/** Portada: la elegida o, si no hay, la primera de la galería */
cabinSchema.virtual('cover').get(function cover() {
  if (!this.images?.length) return null;
  return this.images.find((img) => String(img._id) === String(this.coverImageId)) || this.images[0];
});

cabinSchema.index({ active: 1, order: 1 });

module.exports = model('Cabin', cabinSchema);
