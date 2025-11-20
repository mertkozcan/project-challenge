const express = require('express');
const { getChallenges, addChallenge, latestChallenges, getChallengeDetail } = require('../controllers/challengeController');

const router = express.Router();

router.get('/', getChallenges);
router.post('/', addChallenge);
router.get('/latest', latestChallenges);
router.get('/:id', getChallengeDetail);

module.exports = router;
