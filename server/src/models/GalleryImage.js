const { Schema, model } = require('mongoose');
const { GALLERY_CATEGORIES } = require('../utils/constants');

const galleryImageSchema = new Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, default: null },
    width: Number,
    height: Number,
    alt: { type: String, trim: true, default: '' },
    category: { type: String, enum: GALLERY_CATEGORIES, required: true },
    cabin: { type: Schema.Types.ObjectId, ref: 'Cabin', default: null }, // sólo si category = cabanas
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

galleryImageSchema.index({ category: 1, order: 1 });

module.exports = model('GalleryImage', galleryImageSchema);
