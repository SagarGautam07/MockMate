require('dotenv').config();
const app = require('./src/app');
const mongoose = require('mongoose');
const http = require('http');
const { attachSignaling } = require('./src/realtime/signaling');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    const server = http.createServer(app);
    attachSignaling(server);
    server.listen(PORT, () => {
      console.log(`MockMate API running on http://localhost:${PORT}`);
      console.log(`WebRTC signaling active on ws://localhost:${PORT}/socket.io`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
