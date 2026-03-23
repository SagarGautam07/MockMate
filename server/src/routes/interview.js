const router = require('express').Router();
const auth = require('../middleware/auth');
const Interview = require('../models/Interview');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');
const { generateQuestions, evaluateAnswer, getFallbackQuestions } = require('../services/aiService');

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
    }),
  ]);
}

// POST /api/interview/start - create session, generate AI questions
router.post('/start', auth, async (req, res, next) => {
  try {
    const { type = 'Technical', difficulty = 'Intermediate', role = 'Software Engineer' } = req.body;
    console.log(`[interview/start] user=${req.user.email || req.user._id} type=${type} difficulty=${difficulty} role=${role}`);

    let questions;
    try {
      questions = await withTimeout(generateQuestions(type, difficulty, role, 5), 15000);
    } catch (err) {
      console.warn(`[interview/start] Falling back to local questions: ${err.message}`);
      questions = getFallbackQuestions(type, difficulty);
    }

    // Create session in MongoDB
    const session = await Interview.create({
      userId: req.user._id,
      type,
      difficulty,
      role,
      mode: 'ai',
      status: 'ongoing',
      qaHistory: questions.map((q) => ({ question: q })),
    });

    res.json({
      sessionId: session._id,
      questions,
    });
    console.log(`[interview/start] session=${session._id} questions=${questions.length}`);
  } catch (err) {
    console.error('[interview/start] failed:', err.message);
    next(err);
  }
});

// POST /api/interview/:id/answer - evaluate one answer with AI
router.post('/:id/answer', auth, async (req, res, next) => {
  try {
    const { questionIndex, answer, answerMode = 'text' } = req.body;
    console.log(
      `[interview/answer] session=${req.params.id} user=${req.user.email || req.user._id} questionIndex=${questionIndex} answerLength=${String(answer || '').trim().length}`
    );
    const session = await Interview.findOne({ _id: req.params.id, userId: req.user._id });

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status === 'completed') return res.status(400).json({ error: 'Session already completed' });

    const qa = session.qaHistory[questionIndex];
    if (!qa) return res.status(400).json({ error: 'Invalid question index' });

    let feedback;
    try {
      feedback = await withTimeout(
        evaluateAnswer(qa.question, answer, session.role, session.difficulty, session.type),
        15000
      );
    } catch (err) {
      console.warn(`[interview/answer] Falling back to local evaluation: ${err.message}`);
      const answerLength = String(answer || '').trim().length;
      const score = Math.min(75, Math.max(30, Math.floor(answerLength / 5)));
      feedback = {
        score,
        strengths: ['You attempted the question'],
        improvements: ['Add more specific examples', 'Structure your answer more clearly'],
        suggestion:
          'AI evaluation timed out, so this feedback uses the backup scorer. In a real interview, explain your reasoning clearly and include one concrete example if possible.',
      };
    }

    // Update session
    session.qaHistory[questionIndex].userAnswer = answer;
    session.qaHistory[questionIndex].answerMode = answerMode;
    session.qaHistory[questionIndex].aiFeedback = feedback;
    session.markModified('qaHistory');
    await session.save();

    console.log(
      `[interview/answer] session=${req.params.id} questionIndex=${questionIndex} score=${feedback.score}`
    );
    res.json(feedback);
  } catch (err) {
    console.error('[interview/answer] failed:', err.message);
    next(err);
  }
});

// POST /api/interview/:id/complete - finalize session, award coins, update user stats
router.post('/:id/complete', auth, async (req, res, next) => {
  try {
    const session = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Calculate overall score from all answered questions
    const scored = session.qaHistory.filter((q) => q.aiFeedback?.score != null);
    const overallScore =
      scored.length > 0
        ? Math.round(scored.reduce((sum, q) => sum + q.aiFeedback.score, 0) / scored.length)
        : 0;

    session.status = 'completed';
    session.overallScore = overallScore;
    session.coinsEarned = 5;
    await session.save();

    // Award coins and update user stats atomically
    await Promise.all([
      User.findByIdAndUpdate(req.user._id, {
        $inc: {
          coins: 5,
          'stats.totalSessions': 1,
        },
        $set: {
          'stats.lastActiveDate': new Date(),
        },
      }),
      CoinTransaction.create({
        userId: req.user._id,
        type: 'earn',
        amount: 5,
        reason: `Completed ${session.type} Interview (${session.difficulty})`,
        refModel: 'Interview',
        refId: session._id,
      }),
    ]);

    // Recalculate average score
    const allSessions = await Interview.find({ userId: req.user._id, status: 'completed' });
    const avgScore = Math.round(
      allSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / allSessions.length
    );
    await User.findByIdAndUpdate(req.user._id, { 'stats.avgScore': avgScore });

    res.json({ overallScore, coinsEarned: 5 });
  } catch (err) {
    next(err);
  }
});

// GET /api/interview/history - get user's past sessions
router.get('/history', auth, async (req, res, next) => {
  try {
    const sessions = await Interview.find({ userId: req.user._id, status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('type difficulty overallScore coinsEarned createdAt role duration');

    res.json({ sessions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


