const express = require('express');
const router = express.Router();
const runSessionController = require('../controllers/runSessionController');

// Start a new run session
router.post('/start', runSessionController.startRunSession);

// Get active session for a user
router.get('/active/:userId', runSessionController.getActiveSession);

// Cancel a run session
router.post('/:sessionId/cancel', runSessionController.cancelSession);

// Complete a run session
router.post('/:sessionId/complete', runSessionController.completeSession);

// Get user's session history
router.get('/history/:userId', runSessionController.getSessionHistory);

module.exports = router;
