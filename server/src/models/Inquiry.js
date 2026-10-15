const { Schema, model } = require('mongoose');
const { INQUIRY_TYPES, INQUIRY_STATUS, SLEEPING_OPTIONS } = require('../utils/constants');

const inquirySchema = new Schema(
  {
    type: { type: String, enum: INQUIRY_TYPES, default: 'cabana' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },

    cabin: { type: Schema.Types.ObjectId, ref: 'Cabin', default: null },
    cabinName: { type: String, default: '' },
    promotion: { type: Schema.Types.ObjectId, ref: 'Promotion', default: null },
    promotionTitle: { type: String, default: '' },

    checkIn: Date,
    checkOut: Date,
    nights: Number,
    guests: Number,
    pets: { type: Boolean, default: false },
    sleepingPreference: { type: String, enum: [...SLEEPING_OPTIONS, ''], default: '' },

    eventType: { type: String, trim: true, default: '' },
    eventDate: Date,
    people: Number,
    hours: Number,
    withLodging: { type: Boolean, default: false },

    comments: { type: String, trim: true, default: '' },
    message: { type: String, default: '' },
    status: { type: String, enum: INQUIRY_STATUS, default: 'nueva' },
    notes: { type: String, trim: true, default: '' },
    client: { type: Schema.Types.ObjectId, ref: 'Client', default: null },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });

module.exports = model('Inquiry', inquirySchema);
