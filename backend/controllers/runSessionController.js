const RunSessionModel = require('../models/runSessionModel');

const runSessionController = {
    /**
     * Create a new run session
     * POST /api/run-sessions/start
     */
    startRunSession: async (req, res) => {
        try {
            const { userId, gameName, challengeId, bingoBoardId } = req.body;

            if (!userId || !gameName) {
                return res.status(400).json({
                    error: 'userId and gameName are required'
                });
            }

            // Check if user already has an active session
            const existingSession = await RunSessionModel.getActiveSession(userId);
            if (existingSession) {
                return res.status(200).json({
                    message: 'Active session already exists',
                    session: existingSession
                });
            }

            // Create new session
            const session = await RunSessionModel.createRunSession(
                userId,
                gameName,
                challengeId,
                bingoBoardId
            );

            res.status(201).json({
                message: 'Run session created successfully',
                session
            });
        } catch (error) {
            console.error('Error starting run session:', error);
            res.status(500).json({ error: 'Failed to start run session' });
        }
    },

    /**
     * Get active session for a user
     * GET /api/run-sessions/active/:userId
     */
    getActiveSession: async (req, res) => {
        try {
            const { userId } = req.params;

            const session = await RunSessionModel.getActiveSession(userId);

            if (!session) {
                return res.status(404).json({
                    message: 'No active session found'
                });
            }

            res.status(200).json({ session });
        } catch (error) {
            console.error('Error fetching active session:', error);
            res.status(500).json({ error: 'Failed to fetch active session' });
        }
    },

    /**
     * Cancel/abandon a run session
     * POST /api/run-sessions/:sessionId/cancel
     */
    cancelSession: async (req, res) => {
        try {
            const { sessionId } = req.params;

            const session = await RunSessionModel.abandonSession(sessionId);

            if (!session) {
                return res.status(404).json({
                    error: 'Session not found'
                });
            }

            res.status(200).json({
                message: 'Session cancelled successfully',
                session
            });
        } catch (error) {
            console.error('Error cancelling session:', error);
            res.status(500).json({ error: 'Failed to cancel session' });
        }
    },

    /**
     * Complete a run session
     * POST /api/run-sessions/:sessionId/complete
     */
    completeSession: async (req, res) => {
        try {
            const { sessionId } = req.params;

            const session = await RunSessionModel.completeSession(sessionId);

            if (!session) {
                return res.status(404).json({
                    error: 'Session not found'
                });
            }

            res.status(200).json({
                message: 'Session completed successfully',
                session
            });
        } catch (error) {
            console.error('Error completing session:', error);
            res.status(500).json({ error: 'Failed to complete session' });
        }
    },

    /**
     * Get user's session history
     * GET /api/run-sessions/history/:userId
     */
    getSessionHistory: async (req, res) => {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit) || 20;

            const sessions = await RunSessionModel.getUserSessions(userId, limit);

            res.status(200).json({ sessions });
        } catch (error) {
            console.error('Error fetching session history:', error);
            res.status(500).json({ error: 'Failed to fetch session history' });
        }
    }
};

module.exports = runSessionController;
