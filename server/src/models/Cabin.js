const { Schema, model } = require('mongoose');
const Image = require('./schemas/Image');
const { AMENITIES, BED_TYPES, BED_LOCATIONS, CABIN_TYPES, SLEEPING_OPTIONS } = require('../utils/constants');

const cabinSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    type: { type: String, enum: CABIN_TYPES, default: 'dormitorio' },
    capacity: { type: Number, required: true, min: 1 },
    rooms: { type: Number, default: 1, min: 1 },
    bathrooms: { type: Number, default: 1, min: 0 },
    beds: [
      {
        _id: false,
        type: { type: String, enum: BED_TYPES, required: true },
        quantity: { type: Number, min: 1, default: 1 },
        location: { type: String, enum: BED_LOCATIONS, default: 'dormitorio' },
      },
    ],
    privateBathroom: { type: Boolean, default: true },
    electricWaterHeater: { type: Boolean, default: true },
    sleepingOptions: [{ type: String, enum: SLEEPING_OPTIONS }],
    amenities: [{ type: String, enum: AMENITIES }],
    price: {
      amount: { type: Number, min: 0, default: null },
      show: { type: Boolean, default: false },
    },
    images: [Image],
    coverImageId: { type: Schema.Types.ObjectId, default: null },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

cabinSchema.virtual('cover').get(function cover() {
  if (!this.images?.length) return null;
  return this.images.find((img) => String(img._id) === String(this.coverImageId)) || this.images[0];
});

cabinSchema.index({ active: 1, order: 1 });

module.exports = model('Cabin', cabinSchema);
