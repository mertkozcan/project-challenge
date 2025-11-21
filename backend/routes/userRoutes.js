const express = require('express');
const { getProfile, searchUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/search', searchUsers);
router.get('/:id', getProfile);

module.exports = router;
