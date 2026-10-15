const { Schema } = require('mongoose');

module.exports = new Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, default: null },
    alt: { type: String, trim: true, default: '' },
    width: Number,
    height: Number,
  },
  { _id: true }
);
