const { Schema, model } = require('mongoose');
const { INQUIRY_TYPES, INQUIRY_STATUS } = require('../utils/constants');

/** Registro de cada consulta enviada por WhatsApp desde el sitio */
const inquirySchema = new Schema(
  {
    type: { type: String, enum: INQUIRY_TYPES, default: 'cabana' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },

    cabin: { type: Schema.Types.ObjectId, ref: 'Cabin', default: null },
    cabinName: { type: String, default: '' }, // snapshot por si se borra la cabaña
    promotion: { type: Schema.Types.ObjectId, ref: 'Promotion', default: null },
    promotionTitle: { type: String, default: '' },

    checkIn: Date,
    checkOut: Date,
    nights: Number,
    guests: Number,
    pets: { type: Boolean, default: false },

    // Eventos / día de campo
    eventType: { type: String, trim: true, default: '' },
    eventDate: Date,
    people: Number,
    withLodging: { type: Boolean, default: false },

    comments: { type: String, trim: true, default: '' },
    message: { type: String, default: '' }, // texto exacto enviado a WhatsApp
    status: { type: String, enum: INQUIRY_STATUS, default: 'nueva' },
    notes: { type: String, trim: true, default: '' }, // notas internas
    client: { type: Schema.Types.ObjectId, ref: 'Client', default: null },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });

module.exports = model('Inquiry', inquirySchema);
