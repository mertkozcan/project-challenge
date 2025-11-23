const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const challengeRoutes = require('./routes/challengeRoutes');
const loginRoutes = require('./routes/loginRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bingoRoutes = require('./routes/bingoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const bingoRoomRoutes = require('./routes/bingoRoomRoutes');
const proofRoutes = require('./routes/proofRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const buildRoutes = require('./routes/buildRoutes');
const gameRoutes = require('./routes/gameRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bingoInvitationRoutes = require('./routes/bingoInvitationRoutes');
const userStatsRoutes = require('./routes/userStatsRoutes');
const runSessionRoutes = require('./routes/runSessionRoutes');
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
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

// Routes
app.use('/api/challenges', challengeRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userStatsRoutes); // User stats routes (must be before userRoutes to match specific paths first)
app.use('/api/users', userRoutes);
app.use('/api/bingo', bingoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/multiplayer', bingoRoomRoutes);
app.use('/api/proofs', proofRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/builds', buildRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bingo-invitations', bingoInvitationRoutes);
app.use('/api/run-sessions', runSessionRoutes);
app.use('/api/proofs', proofRoutes); // Existing proof routes (upload etc)
app.use('/api/proofs', require('./routes/proofReviewRoutes')); // New review routes (mounted on same path for now, or separate)

// Server Başlat
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready`);
});
