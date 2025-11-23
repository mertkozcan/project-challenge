const pool = require('../config/db');

/**
 * XP and Leveling System Utilities
 * Handles XP calculations and level progression
 */

/**
 * Calculate required XP for a given level
 * Formula:
 * - Levels 1-10: 100 * level
 * - Levels 11-20: 1000 + 200 * (level - 10)
 * - Levels 21-30: 3000 + 400 * (level - 20)
 * - Levels 31+: 7000 + 800 * (level - 30)
 */
const getXPForLevel = (level) => {
    if (level <= 10) {
        return 100 * level;
    } else if (level <= 20) {
        return 1000 + 200 * (level - 10);
    } else if (level <= 30) {
        return 3000 + 400 * (level - 20);
    } else {
        return 7000 + 800 * (level - 30);
    }
};

/**
 * Calculate total XP needed to reach a level
 */
const getTotalXPForLevel = (level) => {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += getXPForLevel(i);
    }
    return total;
};

/**
 * Calculate level from total XP
 */
const getLevelFromXP = (totalXP) => {
    let level = 1;
    let xpNeeded = 0;

    while (xpNeeded <= totalXP) {
        level++;
        xpNeeded += getXPForLevel(level - 1);
    }

    return level - 1;
};

/**
 * Get XP progress for current level
 * Returns: { level, currentXP, xpForNextLevel, progress }
 */
const getXPProgress = (totalXP) => {
    const level = getLevelFromXP(totalXP);
    const xpForCurrentLevel = getTotalXPForLevel(level);
    const xpForNextLevel = getXPForLevel(level);
    const currentXP = totalXP - xpForCurrentLevel;
    const progress = (currentXP / xpForNextLevel) * 100;

    return {
        level,
        currentXP,
        xpForNextLevel,
        progress: Math.min(progress, 100)
    };
};

/**
 * Award XP to a user and update their level
 */
const awardXP = async (userId, xpAmount, source = 'UNKNOWN') => {
    try {
        // Get current user stats
        const userResult = await pool.query(
            'SELECT total_xp, level FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }

        const currentXP = userResult.rows[0].total_xp || 0;
        const currentLevel = userResult.rows[0].level || 1;
        const newTotalXP = currentXP + xpAmount;
        const newLevel = getLevelFromXP(newTotalXP);

        // Update user XP and level
        await pool.query(
            'UPDATE users SET total_xp = $1, level = $2 WHERE id = $3',
            [newTotalXP, newLevel, userId]
        );

        // Log XP transaction
        await pool.query(
            `INSERT INTO xp_transactions (user_id, amount, source, created_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
            [userId, xpAmount, source]
        );

        const leveledUp = newLevel > currentLevel;

        return {
            success: true,
            xpAwarded: xpAmount,
            totalXP: newTotalXP,
            oldLevel: currentLevel,
            newLevel,
            leveledUp,
            progress: getXPProgress(newTotalXP)
        };
    } catch (error) {
        console.error('Error awarding XP:', error);
        throw error;
    }
};

/**
 * Get XP rewards based on activity
 */
const XP_REWARDS = {
    DAILY_CHALLENGE_EASY: 100,
    DAILY_CHALLENGE_MEDIUM: 200,
    DAILY_CHALLENGE_HARD: 350,
    DAILY_CHALLENGE_EXPERT: 500,
    BINGO_WIN: 200,
    BINGO_PARTICIPATION: 50,
    PROOF_APPROVED: 50,
    STREAK_7_DAYS: 50,
    STREAK_30_DAYS: 200,
    STREAK_100_DAYS: 1000,
};

/**
 * Update user's challenge streak
 */
const updateUserStreak = async (userId) => {
    const today = new Date().toISOString().split('T')[0];

    // Get or create streak record
    let streakResult = await pool.query(
        'SELECT * FROM user_challenge_streaks WHERE user_id = $1',
        [userId]
    );

    if (streakResult.rows.length === 0) {
        // Create new streak record
        await pool.query(
            `INSERT INTO user_challenge_streaks (user_id, current_streak, longest_streak, last_completion_date, total_challenges_completed)
             VALUES ($1, 1, 1, $2, 1)`,
            [userId, today]
        );
        return { currentStreak: 1, longestStreak: 1 };
    }

    const streak = streakResult.rows[0];
    const lastDate = streak.last_completion_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = streak.current_streak;

    // Check if this is a consecutive day
    if (lastDate === yesterdayStr) {
        newStreak = streak.current_streak + 1;
    } else if (lastDate !== today) {
        // Streak broken
        newStreak = 1;
    }

    const newLongest = Math.max(newStreak, streak.longest_streak);

    // Update streak
    await pool.query(
        `UPDATE user_challenge_streaks
         SET current_streak = $1,
             longest_streak = $2,
             last_completion_date = $3,
             total_challenges_completed = total_challenges_completed + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4`,
        [newStreak, newLongest, today, userId]
    );

    // Award streak bonuses
    if (newStreak === 7) {
        await awardXP(userId, XP_REWARDS.STREAK_7_DAYS, 'STREAK_7_DAYS');
    } else if (newStreak === 30) {
        await awardXP(userId, XP_REWARDS.STREAK_30_DAYS, 'STREAK_30_DAYS');
    } else if (newStreak === 100) {
        await awardXP(userId, XP_REWARDS.STREAK_100_DAYS, 'STREAK_100_DAYS');
    }

    return { currentStreak: newStreak, longestStreak: newLongest };
};

module.exports = {
    getXPForLevel,
    getTotalXPForLevel,
    getLevelFromXP,
    getXPProgress,
    awardXP,
    updateUserStreak,
    XP_REWARDS
};
