const { Schema, model, Types } = require('mongoose');

const BookingSchema = new Schema(
  {
    candidateId: { type: Types.ObjectId, ref: 'User', required: true },
    volunteerId: { type: Types.ObjectId, ref: 'Volunteer', required: true },
    scheduledAt: { type: Date, required: true },
    slot: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    coinsCharged: { type: Number, required: true },
    candidateRating: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = model('Booking', BookingSchema);

