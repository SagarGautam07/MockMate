const { Schema, model, Types } = require('mongoose');

const VolunteerSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true }, // e.g. "Senior Engineer at Google"
    expertise: { type: [String], required: true },
    experience: { type: String, required: true },
    availability: [
      {
        day: String,
        slots: [String],
      },
    ],
    coinsCharged: { type: Number, default: 30, min: 10, max: 200 },
    bio: { type: String, maxlength: 300 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model('Volunteer', VolunteerSchema);

