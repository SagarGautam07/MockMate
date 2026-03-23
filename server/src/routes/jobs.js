const router = require('express').Router();
const auth = require('../middleware/auth');
const { fetchJobs } = require('../services/jobService');

// GET /api/jobs — fetch job listings (real or mock)
router.get('/', async (req, res, next) => {
  try {
    const { keyword, location, type, page } = req.query;
    const data = await fetchJobs({ keyword, location, type, page: Number(page) || 1 });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/apply — record job application
router.post('/apply', auth, async (req, res, next) => {
  try {
    const { jobId, title, company } = req.body;
    if (!jobId) return res.status(400).json({ error: 'jobId is required' });
    console.log(`📝 ${req.user.email} applied to: ${title} at ${company}`);
    res.json({ success: true, appliedAt: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

