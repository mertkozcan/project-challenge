const express = require('express');
const { getChallenges, addChallenge, latestChallenges, getChallengeDetail, getPopularChallenges } = require('../controllers/challengeController');

const router = express.Router();

router.get('/', getChallenges);
router.post('/', addChallenge);
router.get('/latest', latestChallenges);
router.get('/popular', getPopularChallenges);
router.get('/:id', getChallengeDetail);

module.exports = router;
