const { Server } = require('socket.io');

function attachSignaling(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, userName }) => {
      if (!roomId) return;

      socket.data.roomId = roomId;
      socket.data.userName = userName || 'Guest';
      socket.join(roomId);

      const room = io.sockets.adapter.rooms.get(roomId);
      const peers = room ? [...room].filter((id) => id !== socket.id) : [];

      socket.emit('room-peers', { peers });
      socket.to(roomId).emit('peer-joined', {
        peerId: socket.id,
        userName: socket.data.userName,
      });
    });

    socket.on('offer', ({ to, sdp }) => {
      if (!to || !sdp) return;
      io.to(to).emit('offer', { from: socket.id, sdp });
    });

    socket.on('answer', ({ to, sdp }) => {
      if (!to || !sdp) return;
      io.to(to).emit('answer', { from: socket.id, sdp });
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
      if (!to || !candidate) return;
      io.to(to).emit('ice-candidate', { from: socket.id, candidate });
    });

    socket.on('leave-room', () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      socket.to(roomId).emit('peer-left', { peerId: socket.id });
      socket.leave(roomId);
      socket.data.roomId = null;
    });

    socket.on('disconnect', () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      socket.to(roomId).emit('peer-left', { peerId: socket.id });
    });
  });
}

module.exports = { attachSignaling };
