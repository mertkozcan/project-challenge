const express = require('express');
const { getChallengeRankings, getGlobalRankings } = require('../controllers/leaderboardController');

const router = express.Router();

router.get('/global', getGlobalRankings);
router.get('/challenge/:challengeId', getChallengeRankings);

module.exports = router;
