const pool = require('../config/db');

/**
 * Rate a build (1-5 stars)
 */
const rateBuild = async (buildId, userId, rating) => {
    // Validate rating
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    // Insert or update rating
    const result = await pool.query(
        `INSERT INTO build_ratings (build_id, user_id, rating)
         VALUES ($1, $2, $3)
         ON CONFLICT (build_id, user_id) 
         DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [buildId, userId, rating]
    );

    // Update build's average rating
    await updateBuildRatingStats(buildId);

    return result.rows[0];
};

/**
 * Get user's rating for a build
 */
const getUserRating = async (buildId, userId) => {
    const result = await pool.query(
        'SELECT rating FROM build_ratings WHERE build_id = $1 AND user_id = $2',
        [buildId, userId]
    );
    return result.rows[0]?.rating || null;
};

/**
 * Update build's rating statistics
 */
const updateBuildRatingStats = async (buildId) => {
    const result = await pool.query(
        `SELECT 
            COUNT(*) as rating_count,
            AVG(rating) as average_rating
         FROM build_ratings
         WHERE build_id = $1`,
        [buildId]
    );

    const { rating_count, average_rating } = result.rows[0];

    await pool.query(
        `UPDATE builds 
         SET average_rating = $1, rating_count = $2
         WHERE id = $3`,
        [average_rating || 0, rating_count || 0, buildId]
    );
};

/**
 * Add a comment to a build
 */
const addComment = async (buildId, userId, comment) => {
    if (!comment || comment.trim().length === 0) {
        throw new Error('Comment cannot be empty');
    }

    const result = await pool.query(
        `INSERT INTO build_comments (build_id, user_id, comment)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [buildId, userId, comment.trim()]
    );

    // Update build's comment count
    await updateBuildCommentCount(buildId);

    return result.rows[0];
};

/**
 * Get comments for a build
 */
const getComments = async (buildId, limit = 50, offset = 0) => {
    const result = await pool.query(
        `SELECT 
            bc.*,
            u.username,
            u.avatar_url,
            u.trust_level,
            u.level
         FROM build_comments bc
         JOIN users u ON bc.user_id = u.id
         WHERE bc.build_id = $1
         ORDER BY bc.created_at DESC
         LIMIT $2 OFFSET $3`,
        [buildId, limit, offset]
    );
    return result.rows;
};

/**
 * Delete a comment (user can only delete their own)
 */
const deleteComment = async (commentId, userId) => {
    const result = await pool.query(
        `DELETE FROM build_comments 
         WHERE id = $1 AND user_id = $2
         RETURNING build_id`,
        [commentId, userId]
    );

    if (result.rows.length === 0) {
        throw new Error('Comment not found or unauthorized');
    }

    // Update build's comment count
    await updateBuildCommentCount(result.rows[0].build_id);

    return result.rows[0];
};

/**
 * Update build's comment count
 */
const updateBuildCommentCount = async (buildId) => {
    const result = await pool.query(
        'SELECT COUNT(*) as comment_count FROM build_comments WHERE build_id = $1',
        [buildId]
    );

    await pool.query(
        'UPDATE builds SET comment_count = $1 WHERE id = $2',
        [result.rows[0].comment_count, buildId]
    );
};

/**
 * Get build rating statistics
 */
const getBuildRatingStats = async (buildId) => {
    const result = await pool.query(
        `SELECT 
            COUNT(*) as total_ratings,
            AVG(rating) as average_rating,
            COUNT(CASE WHEN rating = 5 THEN 1 END) as five_stars,
            COUNT(CASE WHEN rating = 4 THEN 1 END) as four_stars,
            COUNT(CASE WHEN rating = 3 THEN 1 END) as three_stars,
            COUNT(CASE WHEN rating = 2 THEN 1 END) as two_stars,
            COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
         FROM build_ratings
         WHERE build_id = $1`,
        [buildId]
    );
    return result.rows[0];
};

module.exports = {
    rateBuild,
    getUserRating,
    addComment,
    getComments,
    deleteComment,
    getBuildRatingStats
};
