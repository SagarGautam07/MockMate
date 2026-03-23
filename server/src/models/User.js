const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    photoURL: { type: String, default: null },
    coins: { type: Number, default: 150, min: 0 },
    role: { type: String, enum: ['candidate', 'volunteer', 'admin'], default: 'candidate' },

    profile: {
      targetRole: { type: String, default: '' },
      experience: {
        type: String,
        enum: ['Fresher', '1-2 years', '3-5 years', '5+ years'],
        default: 'Fresher',
      },
      skills: { type: [String], default: [] },
      bio: { type: String, default: '', maxlength: 500 },
      resumeURL: { type: String, default: null },
    },

    stats: {
      totalSessions: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
      skillScores: {
        technical: { type: Number, default: 0 },
        behavioral: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        problemSolving: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

module.exports = model('User', UserSchema);

