const { Schema, model } = require('mongoose');

const reviewSchema = new Schema(
  {
    author: { type: String, required: true, trim: true },
    origin: { type: String, trim: true, default: '' },
    rating: { type: Number, min: 1, max: 5, default: null },
    text: { type: String, trim: true, default: '' },
    source: { type: String, trim: true, default: '' },
    date: { type: Date, default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },

    kind: { type: String, enum: ['manual', 'feedback'], default: 'manual' },
    status: { type: String, enum: ['pendiente', 'respondida'], default: 'respondida' },
    token: { type: String, default: undefined },
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
