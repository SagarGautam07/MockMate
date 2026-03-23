const router = require('express').Router();
const auth = require('../middleware/auth');
const Volunteer = require('../models/Volunteer');
const Booking = require('../models/Booking');
const User = require('../models/User');
const CoinTransaction = require('../models/CoinTransaction');

// GET /api/volunteer/list — all approved volunteers
router.get('/list', async (req, res, next) => {
  try {
    const { expertise } = req.query;
    const filter = { isApproved: true };
    if (expertise && expertise !== 'All') {
      filter.expertise = { $in: [expertise] };
    }
    const volunteers = await Volunteer.find(filter).sort({ rating: -1 });
    res.json({ volunteers });
  } catch (err) {
    next(err);
  }
});

// POST /api/volunteer/register — submit volunteer application
router.post('/register', auth, async (req, res, next) => {
  try {
    const { name, role, expertise, experience, availability, coinsCharged, bio } = req.body;
    if (!name?.trim() || !role?.trim() || !expertise?.length) {
      return res.status(400).json({ error: 'Name, role, and expertise are required' });
    }
    const autoApprove =
      process.env.NODE_ENV !== 'production'
        ? true
        : process.env.VOLUNTEER_AUTO_APPROVE === 'true';
    const payload = {
      name: name.trim(),
      role: role.trim(),
      expertise: expertise || [],
      experience: experience || '',
      availability: Array.isArray(availability) ? availability : [],
      coinsCharged: Math.min(200, Math.max(10, Number(coinsCharged) || 30)),
      bio: (bio || '').trim(),
    };

    const existing = await Volunteer.findOne({ userId: req.user._id });
    if (existing) {
      existing.name = payload.name;
      existing.role = payload.role;
      existing.expertise = payload.expertise;
      existing.experience = payload.experience;
      existing.availability = payload.availability;
      existing.coinsCharged = payload.coinsCharged;
      existing.bio = payload.bio;
      if (autoApprove) existing.isApproved = true;
      await existing.save();
      await User.findByIdAndUpdate(req.user._id, { role: 'volunteer' });
      return res.json({
        success: true,
        message: autoApprove
          ? 'Volunteer profile updated and published successfully.'
          : 'Application updated successfully. It is pending approval.',
        alreadyExists: true,
        isApproved: existing.isApproved,
        volunteer: existing,
      });
    }

    const created = await Volunteer.create({
      userId: req.user._id,
      ...payload,
      isApproved: autoApprove,
    });
    await User.findByIdAndUpdate(req.user._id, { role: 'volunteer' });
    res.json({
      success: true,
      message: autoApprove
        ? 'Volunteer profile created and published successfully.'
        : 'Application submitted! You will be reviewed within 24 hours.',
      isApproved: autoApprove,
      volunteer: created,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/volunteer/book — book a volunteer session
router.post('/book', auth, async (req, res, next) => {
  try {
    const { volunteerId, slot, scheduledAt } = req.body;
    const volunteer = await Volunteer.findById(volunteerId);

    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found.' });
    if (!volunteer.isApproved) return res.status(400).json({ error: 'This volunteer is not available.' });

    if (req.user.coins < volunteer.coinsCharged) {
      return res.status(400).json({
        error: `Insufficient coins. You need ${volunteer.coinsCharged} coins for this session.`,
      });
    }

    // Deduct coins
    await User.findByIdAndUpdate(req.user._id, { $inc: { coins: -volunteer.coinsCharged } });
    await CoinTransaction.create({
      userId: req.user._id,
      type: 'spend',
      amount: volunteer.coinsCharged,
      reason: `Booked session with ${volunteer.name}`,
      refModel: 'Volunteer',
      refId: volunteer._id,
    });

    const booking = await Booking.create({
      candidateId: req.user._id,
      volunteerId: volunteer._id,
      scheduledAt: new Date(scheduledAt),
      slot,
      status: 'confirmed',
      coinsCharged: volunteer.coinsCharged,
    });

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
});

// POST /api/volunteer/session/:bookingId/rate — rate after session
router.post('/session/:bookingId/rate', auth, async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const booking = await Booking.findOne({ _id: req.params.bookingId, candidateId: req.user._id });
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    booking.candidateRating = rating;
    booking.feedback = feedback || '';
    booking.status = 'completed';
    await booking.save();

    // Update volunteer rating
    const volunteer = await Volunteer.findById(booking.volunteerId);
    const newTotal = volunteer.totalReviews + 1;
    const newRating = (volunteer.rating * volunteer.totalReviews + rating) / newTotal;
    volunteer.rating = Math.round(newRating * 10) / 10;
    volunteer.totalReviews = newTotal;
    await volunteer.save();

    // Award coins to volunteer based on rating
    const coinsToAward = rating >= 4 ? 10 : rating >= 3 ? 5 : 2;
    await User.findOneAndUpdate({ _id: volunteer.userId }, { $inc: { coins: coinsToAward, 'stats.coinsEarned': coinsToAward } });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
