const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const challengeRoutes = require('./routes/challengeRoutes');
const loginRoutes = require('./routes/loginRoutes');
const initializeSocket = require('./socket/bingoSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Initialize WebSocket
initializeSocket(io);

// Make io accessible in routes
app.set('io', io);

// CORS Middleware
app.use(cors());

// Middleware
app.use(bodyParser.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/challenges', challengeRoutes);
app.use('/api/builds', require('./routes/buildRoutes'));
app.use('/api/proofs', require('./routes/proofRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/bingo', require('./routes/bingoRoutes'));
app.use('/api/bingo', require('./routes/bingoRoomRoutes')); // Multiplayer bingo
app.use('/api/bingo', require('./routes/bingoInvitationRoutes')); // Bingo invitations
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/users', require('./routes/userStatsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/uploads', express.static('uploads'));

// Server Başlat
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready`);
});
