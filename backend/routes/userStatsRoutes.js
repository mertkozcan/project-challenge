const express = require('express');
const router = express.Router();
const { getStats, getActivity, getBuilds, getChallenges, getBingoBoards } = require('../controllers/userStatsController');

router.get('/:userId/stats', getStats);
router.get('/:userId/activity', getActivity);
router.get('/:userId/builds', getBuilds);
router.get('/:userId/challenges', getChallenges);
router.get('/:userId/bingo-boards', getBingoBoards);

module.exports = router;
