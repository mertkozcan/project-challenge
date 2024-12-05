const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const challengeRoutes = require('./routes/challengeRoutes');

const app = express();

// CORS Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend'in çalıştığı URL
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));

// Middleware
app.use(bodyParser.json());

// API Routes
app.use('/api/challenges', challengeRoutes);

// Server Başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
