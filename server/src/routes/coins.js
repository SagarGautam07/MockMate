const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');

// GET /api/coins/history — get user's coin transaction history
router.get('/history', auth, async (req, res, next) => {
  try {
    const transactions = await CoinTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ balance: req.user.coins, transactions });
  } catch (err) {
    next(err);
  }
});

// POST /api/coins/purchase — spend coins on an item
router.post('/purchase', auth, async (req, res, next) => {
  try {
    const { itemId, cost } = req.body;
    if (!cost || cost < 1) return res.status(400).json({ error: 'Invalid cost' });
    if (req.user.coins < cost) return res.status(400).json({ error: 'Insufficient coins' });

    await User.findByIdAndUpdate(req.user._id, { $inc: { coins: -cost } });
    await CoinTransaction.create({
      userId: req.user._id,
      type: 'spend',
      amount: cost,
      reason: `Purchased item: ${itemId}`,
    });
    const newBalance = (req.user.coins || 0) - cost;
    res.json({ success: true, newBalance });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

