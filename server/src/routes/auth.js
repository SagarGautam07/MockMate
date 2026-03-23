const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

/**
 * POST /api/auth/verify
 * Verifies Firebase token and returns the user profile.
 * Called by frontend immediately after Google sign-in.
 */
router.post('/verify', authMiddleware, async (req, res, next) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        photoURL: req.user.photoURL,
        coins: req.user.coins,
        role: req.user.role,
        profile: req.user.profile,
        stats: req.user.stats,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

