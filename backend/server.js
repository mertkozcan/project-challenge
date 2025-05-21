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
app.use('/api/challenges', challengeRoutes);
app.use('/api/auth', loginRoutes);

// Server Başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
