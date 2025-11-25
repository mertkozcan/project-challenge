const express = require('express');
const { addBuild, getBuilds, getBuildDetail, deleteBuild } = require('../controllers/buildController');
const { rateBuild, getUserRating, getRatingStats, addComment, getComments, deleteComment } = require('../controllers/buildRatingController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Build CRUD
router.post('/', addBuild);
router.get('/', getBuilds);
router.get('/:id', getBuildDetail);
router.delete('/:id', authenticateToken, deleteBuild);

// Rating endpoints
router.post('/:buildId/rate', authenticateToken, rateBuild);
router.get('/:buildId/rating', authenticateToken, getUserRating);
router.get('/:buildId/rating-stats', getRatingStats);

// Comment endpoints
router.post('/:buildId/comments', authenticateToken, addComment);
router.get('/:buildId/comments', getComments);
router.delete('/comments/:commentId', authenticateToken, deleteComment);

module.exports = router;
