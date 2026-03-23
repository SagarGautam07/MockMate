const auth = require('./auth');

module.exports = [
  auth,
  (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    return next();
  },
];

