/**
 * Global Express error handler.
 * Catches any error passed via next(err) or thrown in async routes.
 */
module.exports = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    return res.status(409).json({ error: 'This record already exists.' });
  }

  // Default: 500 Internal Server Error
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred.',
  });
};

