const { Schema, model } = require('mongoose');
const Image = require('./schemas/Image');
const { PROMO_TYPES, SEASONS } = require('../utils/constants');

const promotionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    image: { type: Image, default: null },
    type: { type: String, enum: PROMO_TYPES, required: true },
    value: { type: Number, min: 0, default: null }, // % o precio, según el tipo
    valueText: { type: String, trim: true, default: '' }, // para "texto libre" o "3x2"
    appliesToAll: { type: Boolean, default: true },
    cabins: [{ type: Schema.Types.ObjectId, ref: 'Cabin' }],
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    minNights: { type: Number, min: 1, default: 1 },
    season: { type: String, enum: SEASONS, default: 'todo_el_anio' },
    featured: { type: Boolean, default: false }, // aparece en el banner
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

/**
 * Vigente = activa y dentro del rango de fechas (si lo tiene).
 * Así las promos "se encienden y apagan solas" sin cron.
 */
promotionSchema.virtual('isCurrent').get(function isCurrent() {
  const now = new Date();
  if (!this.active) return false;
  if (this.startDate && this.startDate > now) return false;
  if (this.endDate && this.endDate < now) return false;
  return true;
});

/** Filtro de Mongo equivalente a isCurrent */
promotionSchema.statics.currentFilter = function currentFilter(now = new Date()) {
  return {
    active: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  };
};

module.exports = model('Promotion', promotionSchema);
