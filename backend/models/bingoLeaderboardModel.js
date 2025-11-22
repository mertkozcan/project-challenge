const pool = require('../config/db');

/**
 * Get bingo wins leaderboard (solo only for now)
 * @param {number} limit - Number of top players to return
 * @returns {Promise<Array>} Leaderboard entries
 */
const getBingoWinsLeaderboard = async (limit = 100) => {
    const result = await pool.query(`
        SELECT 
            u.id as user_id,
            u.username,
            u.avatar_url,
            COUNT(*) as value,
            ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
        FROM user_bingo_runs ubr
        JOIN users u ON ubr.user_id = u.id
        WHERE ubr.is_finished = true
        GROUP BY u.id, u.username, u.avatar_url
        ORDER BY COUNT(*) DESC
        LIMIT $1
    `, [limit]);

    return result.rows;
};

/**
 * Get fastest solo bingo completions leaderboard
 * @param {number} limit - Number of top players to return
 * @returns {Promise<Array>} Leaderboard entries
 */
const getFastestCompletionsLeaderboard = async (limit = 100) => {
    const result = await pool.query(`
        WITH fastest_times AS (
            SELECT 
                user_id,
                MIN(elapsed_time) as best_time
            FROM user_bingo_runs
            WHERE is_finished = true AND elapsed_time IS NOT NULL
            GROUP BY user_id
        )
        SELECT 
            u.id as user_id,
            u.username,
            u.avatar_url,
            ft.best_time as value,
            ROW_NUMBER() OVER (ORDER BY ft.best_time ASC) as rank
        FROM fastest_times ft
        JOIN users u ON ft.user_id = u.id
        ORDER BY ft.best_time ASC
        LIMIT $1
    `, [limit]);

    return result.rows;
};

/**
 * Get most bingo games played leaderboard
 * @param {number} limit - Number of top players to return
 * @returns {Promise<Array>} Leaderboard entries
 */
const getMostGamesPlayedLeaderboard = async (limit = 100) => {
    const result = await pool.query(`
        SELECT 
            u.id as user_id,
            u.username,
            u.avatar_url,
            COUNT(*) as value,
            ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
        FROM user_bingo_runs ubr
        JOIN users u ON ubr.user_id = u.id
        GROUP BY u.id, u.username, u.avatar_url
        ORDER BY COUNT(*) DESC
        LIMIT $1
    `, [limit]);

    return result.rows;
};

/**
 * Get best win streaks leaderboard
 * @param {number} limit - Number of top players to return
 * @returns {Promise<Array>} Leaderboard entries
 */
const getWinStreaksLeaderboard = async (limit = 100) => {
    const result = await pool.query(`
        SELECT 
            u.id as user_id,
            u.username,
            u.avatar_url,
            u.best_bingo_streak as value,
            ROW_NUMBER() OVER (ORDER BY u.best_bingo_streak DESC) as rank
        FROM users u
        WHERE u.best_bingo_streak > 0
        ORDER BY u.best_bingo_streak DESC
        LIMIT $1
    `, [limit]);

    return result.rows;
};

/**
 * Get user's rank across all bingo leaderboard types
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User ranks for each leaderboard type
 */
const getUserBingoRanks = async (userId) => {
    // Get wins rank
    const winsRank = await pool.query(`
        WITH ranked AS (
            SELECT 
                user_id,
                ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
            FROM user_bingo_runs
            WHERE is_finished = true
            GROUP BY user_id
        )
        SELECT rank FROM ranked WHERE user_id = $1
    `, [userId]);

    // Get fastest time rank
    const fastestRank = await pool.query(`
        WITH fastest_times AS (
            SELECT 
                user_id,
                MIN(elapsed_time) as best_time
            FROM user_bingo_runs
            WHERE is_finished = true AND elapsed_time IS NOT NULL
            GROUP BY user_id
        ),
        ranked AS (
            SELECT 
                user_id,
                ROW_NUMBER() OVER (ORDER BY best_time ASC) as rank
            FROM fastest_times
        )
        SELECT rank FROM ranked WHERE user_id = $1
    `, [userId]);

    // Get games played rank
    const gamesRank = await pool.query(`
        WITH ranked AS (
            SELECT 
                user_id,
                ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
            FROM user_bingo_runs
            GROUP BY user_id
        )
        SELECT rank FROM ranked WHERE user_id = $1
    `, [userId]);

    // Get streak rank
    const streakRank = await pool.query(`
        WITH ranked AS (
            SELECT 
                id as user_id,
                ROW_NUMBER() OVER (ORDER BY best_bingo_streak DESC) as rank
            FROM users
            WHERE best_bingo_streak > 0
        )
        SELECT rank FROM ranked WHERE user_id = $1
    `, [userId]);

    return {
        wins: winsRank.rows[0]?.rank || null,
        fastest: fastestRank.rows[0]?.rank || null,
        games: gamesRank.rows[0]?.rank || null,
        streaks: streakRank.rows[0]?.rank || null
    };
};

module.exports = {
    getBingoWinsLeaderboard,
    getFastestCompletionsLeaderboard,
    getMostGamesPlayedLeaderboard,
    getWinStreaksLeaderboard,
    getUserBingoRanks
};
