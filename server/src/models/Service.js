const { Schema, model } = require('mongoose');

const serviceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true }, // nombre de ícono de Lucide (ej: "Wifi")
    description: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model('Service', serviceSchema);
