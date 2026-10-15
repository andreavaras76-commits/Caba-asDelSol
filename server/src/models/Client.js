const { Schema, model } = require('mongoose');
const { CLIENT_TAGS } = require('../utils/constants');

const clientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    cabin: { type: Schema.Types.ObjectId, ref: 'Cabin', default: null },
    lastStay: { type: Date, default: null },
    feedbackRequestedAt: { type: Date, default: null },
    lastFeedbackAt: { type: Date, default: null },
    lastRating: { type: Number, min: 1, max: 5, default: null },
    notes: { type: String, trim: true, default: '' },
    tags: [{ type: String, enum: CLIENT_TAGS }],
    promotionsSent: [
      {
        _id: false,
        promotion: { type: Schema.Types.ObjectId, ref: 'Promotion' },
        sentAt: { type: Date, default: Date.now },
      },
    ],
    fromInquiry: { type: Schema.Types.ObjectId, ref: 'Inquiry', default: null },
  },
  { timestamps: true }
);

clientSchema.index({ phone: 1 }, { unique: true });
clientSchema.index({ tags: 1 });

module.exports = model('Client', clientSchema);
