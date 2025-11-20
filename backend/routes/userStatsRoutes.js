const express = require('express');
const router = express.Router();
const { getStats, getActivity, getBuilds } = require('../controllers/userStatsController');

router.get('/:userId/stats', getStats);
router.get('/:userId/activity', getActivity);
router.get('/:userId/builds', getBuilds);

module.exports = router;
