const pool = require('../config/db');

/**
 * Get user's solo bingo history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Solo bingo games
 */
const getUserSoloHistory = async (userId) => {
    try {
        const result = await pool.query(
            `SELECT 
                ubr.board_id,
                ubr.elapsed_time,
                ubr.is_finished,
                ubr.finished_at,
                ubr.updated_at as last_played,
                bb.title as board_title,
                bb.game_name,
                bb.size,
                (SELECT COUNT(*) FROM user_bingo_progress 
                 WHERE user_id = $1 AND board_id = ubr.board_id AND status = 'APPROVED') as completed_cells,
                (bb.size * bb.size) as total_cells
             FROM user_bingo_runs ubr
             JOIN bingo_boards bb ON ubr.board_id = bb.id
             WHERE ubr.user_id = $1
             ORDER BY ubr.updated_at DESC`,
            [userId]
        );

        return result.rows.map(row => ({
            ...row,
            completion_percentage: Math.round((row.completed_cells / row.total_cells) * 100)
        }));
    } catch (error) {
        console.error('Error getting solo history:', error);
        throw error;
    }
};

/**
 * Get user's bingo statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics
 */
const getUserBingoStats = async (userId) => {
    try {
        // Solo games stats
        const soloStats = await pool.query(
            `SELECT 
                COUNT(*) as total_solo_games,
                COUNT(CASE WHEN is_finished = true THEN 1 END) as completed_solo_games,
                AVG(CASE WHEN is_finished = true THEN elapsed_time END) as avg_completion_time,
                MIN(CASE WHEN is_finished = true THEN elapsed_time END) as fastest_time
             FROM user_bingo_runs
             WHERE user_id = $1`,
            [userId]
        );

        // Total bingo lines completed
        const linesCompleted = await pool.query(
            `SELECT COUNT(*) as total_lines
             FROM user_bingo_progress
             WHERE user_id = $1 AND status = 'APPROVED'`,
            [userId]
        );

        // Favorite game
        const favoriteGame = await pool.query(
            `SELECT bb.game_name, COUNT(*) as play_count
             FROM user_bingo_runs ubr
             JOIN bingo_boards bb ON ubr.board_id = bb.id
             WHERE ubr.user_id = $1
             GROUP BY bb.game_name
             ORDER BY play_count DESC
             LIMIT 1`,
            [userId]
        );

        const solo = soloStats.rows[0];
        const lines = linesCompleted.rows[0];

        return {
            total_games: parseInt(solo.total_solo_games || 0),
            solo_games: parseInt(solo.total_solo_games || 0),
            multiplayer_games: 0, // TODO: Add when multiplayer history table exists
            completed_solo_games: parseInt(solo.completed_solo_games || 0),
            wins: 0, // TODO: Add when multiplayer history table exists
            win_rate: 0,
            avg_completion_time: parseInt(solo.avg_completion_time || 0),
            fastest_time: parseInt(solo.fastest_time || 0),
            total_lines_completed: parseInt(lines.total_lines || 0),
            favorite_game: favoriteGame.rows[0]?.game_name || null
        };
    } catch (error) {
        console.error('Error getting bingo stats:', error);
        throw error;
    }
};

module.exports = {
    getUserSoloHistory,
    getUserBingoStats
};
