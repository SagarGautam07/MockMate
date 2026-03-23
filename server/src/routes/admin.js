const router = require('express').Router();
const requireAdmin = require('../middleware/requireAdmin');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const Interview = require('../models/Interview');
const Booking = require('../models/Booking');
const CoinTransaction = require('../models/CoinTransaction');

router.use(requireAdmin);

router.get('/overview', async (req, res, next) => {
  try {
    const [users, volunteers, pendingVolunteers, interviews, bookings] = await Promise.all([
      User.countDocuments(),
      Volunteer.countDocuments({ isApproved: true }),
      Volunteer.countDocuments({ isApproved: false }),
      Interview.countDocuments({ status: 'completed' }),
      Booking.countDocuments(),
    ]);

    res.json({
      users,
      approvedVolunteers: volunteers,
      pendingVolunteers,
      completedInterviews: interviews,
      bookings,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/volunteers', async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const filter = {};
    if (status === 'approved') filter.isApproved = true;
    if (status === 'pending') filter.isApproved = false;

    const volunteers = await Volunteer.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json({ volunteers });
  } catch (err) {
    next(err);
  }
});

router.patch('/volunteers/:id/approval', async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ error: 'isApproved (boolean) is required.' });
    }

    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { $set: { isApproved } },
      { new: true }
    );
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found.' });

    res.json({ success: true, volunteer });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .select('name email role coins createdAt stats.totalSessions stats.avgScore');
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const transactions = await CoinTransaction.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .select('type amount reason createdAt userId');
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

