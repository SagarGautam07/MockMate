const { Schema, model, Types } = require('mongoose');

const CoinTransactionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['earn', 'spend'], required: true },
    amount: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    refModel: { type: String, default: null }, // 'Interview', 'Booking', etc.
    refId: { type: Types.ObjectId, default: null },
  },
  { timestamps: true }
);

module.exports = model('CoinTransaction', CoinTransactionSchema);

