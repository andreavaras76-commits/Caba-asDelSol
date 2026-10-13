const { Schema, model } = require('mongoose');

/** Sólo reseñas reales, cargadas a mano desde el panel */
const reviewSchema = new Schema(
  {
    author: { type: String, required: true, trim: true },
    origin: { type: String, trim: true, default: '' }, // ciudad de procedencia
    rating: { type: Number, min: 1, max: 5, default: 5 },
    text: { type: String, required: true, trim: true },
    source: { type: String, trim: true, default: '' }, // Google, Booking, Instagram…
    date: { type: Date, default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Review', reviewSchema);
