const { Schema, model } = require('mongoose');

const blockedDateSchema = new Schema(
  {
    cabin: { type: Schema.Types.ObjectId, ref: 'Cabin', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

blockedDateSchema.index({ cabin: 1, startDate: 1, endDate: 1 });

blockedDateSchema.statics.overlaps = function overlaps(cabinId, checkIn, checkOut) {
  return this.exists({ cabin: cabinId, startDate: { $lt: checkOut }, endDate: { $gt: checkIn } });
};

module.exports = model('BlockedDate', blockedDateSchema);
