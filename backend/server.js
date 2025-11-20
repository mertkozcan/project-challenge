const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const challengeRoutes = require('./routes/challengeRoutes');
const loginRoutes = require('./routes/loginRoutes');

const app = express();

// CORS Middleware
app.use(cors());

console.log(`Server running on port ${PORT}`);
});
