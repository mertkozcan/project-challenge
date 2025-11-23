const pool = require('../config/db');

const AchievementModel = {
    // Get all available achievements
    getAllAchievements: async () => {
        const result = await pool.query('SELECT * FROM achievements ORDER BY threshold ASC');
        return result.rows;
    },

    // Get achievements unlocked by a specific user
    getUserAchievements: async (userId) => {
        const query = `
      SELECT a.*, ua.unlocked_at
      FROM achievements a
      JOIN user_achievements ua ON a.id = ua.achievement_id
      WHERE ua.user_id = $1
      ORDER BY ua.unlocked_at DESC
    `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    },

    // Unlock an achievement for a user
    unlockAchievement: async (userId, achievementId) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if already unlocked
            const check = await client.query(
                'SELECT * FROM user_achievements WHERE user_id = $1 AND achievement_id = $2',
                [userId, achievementId]
            );

            if (check.rows.length > 0) {
                await client.query('ROLLBACK');
                return null; // Already unlocked
            }

            // Unlock
            await client.query(
                'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)',
                [userId, achievementId]
            );

            // Get achievement details for notification
            const achievement = await client.query(
                'SELECT * FROM achievements WHERE id = $1',
                [achievementId]
            );

            await client.query('COMMIT');
            return achievement.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Check and unlock achievements based on user stats
    checkAndUnlockAchievements: async (userId, currentRunTime = null) => {
        const client = await pool.connect();
        try {
            // Get user stats (combining solo and multiplayer)
            const userStats = await client.query(`
                WITH solo_stats AS (
                    SELECT 
                        COUNT(*) FILTER (WHERE is_finished = TRUE) as solo_wins,
                        COUNT(*) as solo_games
                    FROM user_bingo_runs
                    WHERE user_id = $1
                ),
                multi_stats AS (
                    SELECT 
                        COUNT(*) FILTER (WHERE r.status = 'COMPLETED' AND r.winner_user_id = $1) as multi_wins,
                        COUNT(*) as multi_games
                    FROM bingo_rooms r
                    JOIN bingo_room_participants p ON r.id = p.room_id
                    WHERE p.user_id = $1
                ),
                user_info AS (
                    SELECT current_bingo_streak FROM users WHERE id = $1
                )
                SELECT 
                    (s.solo_wins + m.multi_wins) as total_wins,
                    (s.solo_games + m.multi_games) as total_games,
                    u.current_bingo_streak
                FROM solo_stats s, multi_stats m, user_info u
            `, [userId]);

            const stats = userStats.rows[0];
            const wins = parseInt(stats.total_wins) || 0;
            const games = parseInt(stats.total_games) || 0;
            const streak = parseInt(stats.current_bingo_streak) || 0;

            // Get all achievements
            const achievements = await client.query('SELECT * FROM achievements');
            const unlocked = [];

            for (const achievement of achievements.rows) {
                let shouldUnlock = false;

                switch (achievement.type) {
                    case 'WINS':
                        if (wins >= achievement.threshold) shouldUnlock = true;
                        break;
                    case 'GAMES':
                        if (games >= achievement.threshold) shouldUnlock = true;
                        break;
                    case 'STREAK':
                        if (streak >= achievement.threshold) shouldUnlock = true;
                        break;
                    case 'SPEED':
                        // Only check speed if we have a current run time
                        if (currentRunTime !== null && currentRunTime <= achievement.threshold) {
                            shouldUnlock = true;
                        }
                        break;
                }

                if (shouldUnlock) {
                    // Try to unlock (will be ignored if already unlocked)
                    const result = await AchievementModel.unlockAchievement(userId, achievement.id);
                    if (result) {
                        unlocked.push(result);
                    }
                }
            }

            return unlocked;
        } catch (error) {
            console.error('Error checking achievements:', error);
            return [];
        } finally {
            client.release();
        }
    }
};

module.exports = AchievementModel;
