const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const challengeRoutes = require('./routes/challengeRoutes');
const loginRoutes = require('./routes/loginRoutes');

const app = express();

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
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/uploads', express.static('uploads'));

// Server Başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
