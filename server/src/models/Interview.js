const { Schema, model, Types } = require('mongoose');

const QASchema = new Schema(
  {
    question: { type: String, required: true },
    userAnswer: { type: String, default: '' },
    answerMode: { type: String, enum: ['text', 'voice'], default: 'text' },
    aiFeedback: {
      score: { type: Number, min: 0, max: 100 },
      strengths: [String],
      improvements: [String],
      suggestion: String,
    },
  },
  { _id: false }
);

const InterviewSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['Technical', 'Behavioral', 'System Design', 'HR'], required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
    role: { type: String, default: 'Software Engineer' },
    mode: { type: String, enum: ['ai', 'volunteer'], default: 'ai' },
    status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
    qaHistory: [QASchema],
    overallScore: { type: Number, default: null },
    coinsEarned: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // seconds
  },
  { timestamps: true }
);

module.exports = model('Interview', InterviewSchema);

