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
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bingo', bingoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/multiplayer', bingoRoomRoutes);
app.use('/api/proofs', proofRoutes);
app.use('/api', loginRoutes);

// Server Başlat
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server ready`);
});
