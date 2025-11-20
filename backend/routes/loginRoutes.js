const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/signup', loginController.registerUser);
router.post('/signin', loginController.loginUser);

module.exports = router;
