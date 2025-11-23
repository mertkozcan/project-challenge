const buildRatingModel = require('../models/buildRatingModel');

/**
 * POST /api/builds/:buildId/rate
 * Rate a build (1-5 stars)
 */
const rateBuild = async (req, res) => {
    const { buildId } = req.params;
    const { rating } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const result = await buildRatingModel.rateBuild(buildId, userId, rating);
        res.json({
            message: 'Rating submitted successfully',
            rating: result
        });
    } catch (error) {
        console.error('Error rating build:', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * GET /api/builds/:buildId/rating
 * Get user's rating for a build
 */
const getUserRating = async (req, res) => {
    const { buildId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.json({ rating: null });
    }

    try {
        const rating = await buildRatingModel.getUserRating(buildId, userId);
        res.json({ rating });
    } catch (error) {
        console.error('Error getting user rating:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/builds/:buildId/rating-stats
 * Get build rating statistics
 */
const getRatingStats = async (req, res) => {
    const { buildId } = req.params;

    try {
        const stats = await buildRatingModel.getBuildRatingStats(buildId);
        res.json(stats);
    } catch (error) {
        console.error('Error getting rating stats:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /api/builds/:buildId/comments
 * Add a comment to a build
 */
const addComment = async (req, res) => {
    const { buildId } = req.params;
    const { comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const result = await buildRatingModel.addComment(buildId, userId, comment);
        res.json({
            message: 'Comment added successfully',
            comment: result
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * GET /api/builds/:buildId/comments
 * Get comments for a build
 */
const getComments = async (req, res) => {
    const { buildId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const comments = await buildRatingModel.getComments(buildId, limit, offset);
        res.json(comments);
    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * DELETE /api/builds/comments/:commentId
 * Delete a comment
 */
const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        await buildRatingModel.deleteComment(commentId, userId);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    rateBuild,
    getUserRating,
    getRatingStats,
    addComment,
    getComments,
    deleteComment
};
