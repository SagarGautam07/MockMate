const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users/me — get current user's full profile
router.get('/me', auth, async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/me — update profile fields
router.patch('/me', auth, async (req, res, next) => {
  try {
    const allowed = ['name', 'profile'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const updated = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, user: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

