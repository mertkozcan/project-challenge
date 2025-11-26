const pool = require('../config/db');

const getUserStats = async (userId) => {
    try {
        // Total challenges completed
        const completedChallenges = await pool.query(
            `SELECT COUNT(DISTINCT challenge_id) as count
             FROM proofs WHERE user_id = $1 AND status = 'APPROVED'`,
            [userId]
        );

        // Active challenges (submitted but not approved yet)
        const activeChallenges = await pool.query(
            `SELECT COUNT(DISTINCT challenge_id) as count
             FROM proofs WHERE user_id = $1 AND status = 'PENDING'`,
            [userId]
        );

        // Total builds created
        const createdBuilds = await pool.query(
            `SELECT COUNT(*) as count FROM builds WHERE user_id = $1`,
            [userId]
        );

        // Total points
        const userPoints = await pool.query(
            `SELECT points FROM users WHERE id = $1`,
            [userId]
        );

        // Global rank position
        const rankQuery = await pool.query(
            `SELECT rank FROM (
                SELECT id, ROW_NUMBER() OVER (ORDER BY points DESC) as rank
                FROM users
            ) ranked WHERE id = $1`,
            [userId]
        );

        // Completed bingo boards
        const completedBingos = await pool.query(
            `SELECT COUNT(*) as count 
             FROM user_bingo_runs 
             WHERE user_id = $1 AND is_finished = true`,
            [userId]
        );

        // Active bingo boards (started but not finished)
        const activeBingos = await pool.query(
            `SELECT COUNT(*) as count 
             FROM user_bingo_runs 
             WHERE user_id = $1 AND is_finished = false AND elapsed_time > 0`,
            [userId]
        );

        return {
            completedChallenges: parseInt(completedChallenges.rows[0]?.count || 0),
            activeChallenges: parseInt(activeChallenges.rows[0]?.count || 0),
            createdBuilds: parseInt(createdBuilds.rows[0]?.count || 0),
            points: parseInt(userPoints.rows[0]?.points || 0),
            globalRank: rankQuery.rows[0]?.rank || null,
            completedBingos: parseInt(completedBingos.rows[0]?.count || 0),
            activeBingos: parseInt(activeBingos.rows[0]?.count || 0),
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
};

const getUserActivity = async (userId, limit = 20) => {
    try {
        const result = await pool.query(
            `SELECT p.id, p.score, p.created_at, c.challenge_name, c.game_name, c.type
             FROM proofs p
             JOIN challenges c ON p.challenge_id = c.id
             WHERE p.user_id = $1 AND p.status = 'APPROVED'
             ORDER BY p.created_at DESC
             LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting user activity:', error);
        throw error;
    }
};

const getUserBuilds = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT b.*, g.icon_url as game_icon
             FROM builds b
             LEFT JOIN games g ON b.game_name = g.name
             WHERE b.user_id = $1
             ORDER BY b.created_at DESC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting user builds:', error);
        throw error;
    }
};

const getUserChallenges = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT c.*, g.icon_url as game_icon
             FROM challenges c
             LEFT JOIN games g ON c.game_name = g.name
             WHERE c.created_by = $1
             ORDER BY c.created_at DESC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting user challenges:', error);
        throw error;
    }
};

const getUserBingoBoards = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT b.*, g.icon_url as game_icon
             FROM bingo_boards b
             LEFT JOIN games g ON b.game_name = g.name
             WHERE b.created_by = $1
             ORDER BY b.created_at DESC`,
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error('Error getting user bingo boards:', error);
        throw error;
    }
};

module.exports = {
    getUserStats,
    getUserActivity,
    getUserBuilds,
    getUserChallenges,
    getUserBingoBoards,
};
