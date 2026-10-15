const { Schema, model } = require('mongoose');
const { SERVICE_GROUPS } = require('../utils/constants');

const serviceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    group: { type: String, enum: SERVICE_GROUPS, default: 'servicio' },
    description: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Service', serviceSchema);
