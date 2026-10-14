const { Schema, model } = require('mongoose');

/**
 * Reseñas reales. Pueden venir de dos lugares:
 * - feedback: el panel le manda al cliente un link por WhatsApp (token) y él puntúa y comenta.
 * - manual: se cargan a mano desde el panel (Google, Booking…).
 * Sólo las que tienen `active: true` se publican en el sitio.
 */
const reviewSchema = new Schema(
  {
    author: { type: String, required: true, trim: true },
    origin: { type: String, trim: true, default: '' }, // ciudad de procedencia
    rating: { type: Number, min: 1, max: 5, default: null },
    text: { type: String, trim: true, default: '' },
    source: { type: String, trim: true, default: '' }, // Google, Booking, Instagram…
    date: { type: Date, default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true }, // publicada en el sitio

    // Pedido de opinión por WhatsApp
    kind: { type: String, enum: ['manual', 'feedback'], default: 'manual' },
    status: { type: String, enum: ['pendiente', 'respondida'], default: 'respondida' },
    token: { type: String, default: undefined }, // link único /opinar/:token
    client: { type: Schema.Types.ObjectId, ref: 'Client', default: null },
    cabin: { type: Schema.Types.ObjectId, ref: 'Cabin', default: null },
    requestedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reviewSchema.index({ token: 1 }, { unique: true, sparse: true });
reviewSchema.index({ client: 1, createdAt: -1 });

module.exports = model('Review', reviewSchema);
