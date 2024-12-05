const express = require('express');
const { getChallenges, addChallenge, latestChallenges} = require('../controllers/challengeController');

const router = express.Router();

router.get('/', getChallenges);
router.post('/', addChallenge);
router.get('/latest', latestChallenges);

module.exports = router;
