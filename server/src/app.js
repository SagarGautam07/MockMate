const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow frontend origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);
      // Allow all Vercel preview and production URLs
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      // Allow localhost for local development
      if (origin.startsWith('http://localhost')) return callback(null, true);
      if (origin.startsWith('http://127.0.0.1')) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10kb' }));

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please wait and try again.' },
});
app.use('/api/', limiter);

// Health check (no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/volunteer', require('./routes/volunteer'));
app.use('/api/coins', require('./routes/coins'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/admin', require('./routes/admin'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
