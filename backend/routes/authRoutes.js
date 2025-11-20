const express = require('express');
const { signUp, getProfile } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signUp);
router.get('/profile/:id', getProfile);

module.exports = router;
