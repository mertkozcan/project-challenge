const pool = require('../config/db');

/**
 * Game-specific word pools for username generation
 */
const GAME_WORD_POOLS = {
    'Elden Ring': {
        adjectives: [
            'Golden', 'Silver', 'Crimson', 'Azure', 'Radiant', 'Fell', 'Ancient', 'Eternal',
            'Blessed', 'Cursed', 'Moonlit', 'Starlit', 'Flame', 'Frost', 'Storm', 'Shadow',
            'Holy', 'Dark', 'Glorious', 'Mighty', 'Swift', 'Iron', 'Rune', 'Spectral'
        ],
        nouns: [
            'Tarnished', 'Knight', 'Warrior', 'Champion', 'Blade', 'Sentinel', 'Guardian',
            'Hunter', 'Seeker', 'Wanderer', 'Slayer', 'Lord', 'Maiden', 'Sage', 'Prophet',
            'Warden', 'Reaver', 'Conqueror', 'Defender', 'Avenger', 'Crusader', 'Paladin'
        ]
    },
    'Dark Souls': {
        adjectives: [
            'Hollow', 'Ashen', 'Ember', 'Undead', 'Cursed', 'Blessed', 'Dark', 'Light',
            'Flame', 'Frost', 'Lightning', 'Divine', 'Abyssal', 'Crystal', 'Chaos', 'Ancient'
        ],
        nouns: [
            'Knight', 'Warrior', 'Slayer', 'Hunter', 'Seeker', 'Wanderer', 'Champion',
            'Sentinel', 'Guardian', 'Blade', 'Lord', 'Chosen', 'Bearer', 'Kindler'
        ]
    },
    'Bloodborne': {
        adjectives: [
            'Blood', 'Moon', 'Pale', 'Crimson', 'Eldritch', 'Cosmic', 'Arcane', 'Vile',
            'Cursed', 'Blessed', 'Frenzy', 'Insight', 'Dreaming', 'Waking', 'Lost', 'Found'
        ],
        nouns: [
            'Hunter', 'Slayer', 'Seeker', 'Wanderer', 'Scholar', 'Disciple', 'Executioner',
            'Watcher', 'Stalker', 'Reaper', 'Crow', 'Beast', 'Choir', 'Vicar'
        ]
    },
    // Default pool for unknown games
    'Default': {
        adjectives: [
            'Swift', 'Mighty', 'Brave', 'Noble', 'Fierce', 'Silent', 'Bold', 'Wise',
            'Strong', 'Quick', 'Keen', 'Sharp', 'Bright', 'Dark', 'Wild', 'Free'
        ],
        nouns: [
            'Warrior', 'Knight', 'Hunter', 'Champion', 'Hero', 'Legend', 'Guardian',
            'Defender', 'Seeker', 'Wanderer', 'Adventurer', 'Explorer', 'Conqueror'
        ]
    }
};

/**
 * Generate a unique username based on game
 * @param {string} gameName - Game name (e.g., 'Elden Ring')
 * @returns {string} Generated username (e.g., 'GoldenKnight')
 */
function generateGameUsername(gameName) {
    // Get word pool for game, fallback to Default
    const wordPool = GAME_WORD_POOLS[gameName] || GAME_WORD_POOLS['Default'];

    // Randomly select adjective and noun
    const adjective = wordPool.adjectives[Math.floor(Math.random() * wordPool.adjectives.length)];
    const noun = wordPool.nouns[Math.floor(Math.random() * wordPool.nouns.length)];

    return `${adjective}${noun}`;
}

/**
 * Generate a unique 4-character alphanumeric run code (internal use only)
 * Format: #XXXX (e.g., #A7B2, #TR42)
 */
function generateRunCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '#';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const RunSessionModel = {
    /**
     * Create a new run session with unique username and code
     * @param {string} userId - User ID
     * @param {string} gameName - Game name (e.g., 'Elden Ring')
     * @param {number|null} challengeId - Challenge ID (for challenges)
     * @param {number|null} bingoBoardId - Bingo board ID (for bingo)
     * @returns {Promise<object>} Created session with run_code and display_username
     */
    createRunSession: async (userId, gameName, challengeId = null, bingoBoardId = null) => {
        let runCode;
        let displayUsername;
        let attempts = 0;
        const maxAttempts = 20;

        // Try to generate unique code and username (retry if collision)
        while (attempts < maxAttempts) {
            runCode = generateRunCode();
            displayUsername = generateGameUsername(gameName);

            try {
                const result = await pool.query(
                    `INSERT INTO run_sessions (user_id, game_name, challenge_id, bingo_board_id, run_code, display_username)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
                    [userId, gameName, challengeId, bingoBoardId, runCode, displayUsername]
                );

                return result.rows[0];
            } catch (error) {
                // If unique constraint violation, try again with new values
                if (error.code === '23505') {
                    attempts++;
                    continue;
                }
                throw error;
            }
        }

        throw new Error('Failed to generate unique run session after multiple attempts');
    },

    /**
     * Get active session for a user
     * @param {string} userId - User ID
     * @returns {Promise<object|null>} Active session or null
     */
    getActiveSession: async (userId) => {
        const result = await pool.query(
            `SELECT * FROM run_sessions
       WHERE user_id = $1 
       AND status = 'ACTIVE'
       AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC
       LIMIT 1`,
            [userId]
        );

        return result.rows[0] || null;
    },

    /**
     * Get session by run code
     * @param {string} runCode - Run code (e.g., '#A7B2')
     * @returns {Promise<object|null>} Session or null
     */
    getSessionByCode: async (runCode) => {
        const result = await pool.query(
            'SELECT * FROM run_sessions WHERE run_code = $1',
            [runCode]
        );

        return result.rows[0] || null;
    },

    /**
     * Get session by display username
     * @param {string} displayUsername - Display username (e.g., 'GoldenKnight')
     * @returns {Promise<object|null>} Session or null
     */
    getSessionByUsername: async (displayUsername) => {
        const result = await pool.query(
            `SELECT * FROM run_sessions 
       WHERE display_username = $1 
       AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC
       LIMIT 1`,
            [displayUsername]
        );

        return result.rows[0] || null;
    },

    /**
     * Validate run code belongs to user
     * @param {string} runCode - Run code
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} True if valid
     */
    validateRunCode: async (runCode, userId) => {
        const result = await pool.query(
            `SELECT id FROM run_sessions
       WHERE run_code = $1 
       AND user_id = $2
       AND expires_at > CURRENT_TIMESTAMP`,
            [runCode, userId]
        );

        return result.rows.length > 0;
    },

    /**
     * Validate display username belongs to user
     * @param {string} displayUsername - Display username
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} True if valid
     */
    validateUsername: async (displayUsername, userId) => {
        const result = await pool.query(
            `SELECT id FROM run_sessions
       WHERE display_username = $1 
       AND user_id = $2
       AND expires_at > CURRENT_TIMESTAMP`,
            [displayUsername, userId]
        );

        return result.rows.length > 0;
    },

    /**
     * Complete a run session
     * @param {string} sessionId - Session UUID
     * @returns {Promise<object>} Updated session
     */
    completeSession: async (sessionId) => {
        const result = await pool.query(
            `UPDATE run_sessions
       SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
            [sessionId]
        );

        return result.rows[0];
    },

    /**
     * Complete session by run code
     * @param {string} runCode - Run code
     * @returns {Promise<object>} Updated session
     */
    completeSessionByCode: async (runCode) => {
        const result = await pool.query(
            `UPDATE run_sessions
       SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP
       WHERE run_code = $1
       RETURNING *`,
            [runCode]
        );

        return result.rows[0];
    },

    /**
     * Abandon/cancel a run session
     * @param {string} sessionId - Session UUID
     * @returns {Promise<object>} Updated session
     */
    abandonSession: async (sessionId) => {
        const result = await pool.query(
            `UPDATE run_sessions
       SET status = 'ABANDONED'
       WHERE id = $1
       RETURNING *`,
            [sessionId]
        );

        return result.rows[0];
    },

    /**
     * Clean up expired sessions (for cron job)
     * @returns {Promise<number>} Number of deleted sessions
     */
    cleanupExpiredSessions: async () => {
        const result = await pool.query(
            `DELETE FROM run_sessions
       WHERE expires_at < CURRENT_TIMESTAMP
       AND status = 'ACTIVE'
       RETURNING id`
        );

        return result.rows.length;
    },

    /**
     * Get user's session history
     * @param {string} userId - User ID
     * @param {number} limit - Max results
     * @returns {Promise<array>} Session history
     */
    getUserSessions: async (userId, limit = 20) => {
        const result = await pool.query(
            `SELECT * FROM run_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
            [userId, limit]
        );

        return result.rows;
    },

    /**
     * Get available word pools for a game
     * @param {string} gameName - Game name
     * @returns {object} Word pool with adjectives and nouns
     */
    getGameWordPool: (gameName) => {
        return GAME_WORD_POOLS[gameName] || GAME_WORD_POOLS['Default'];
    }
};

module.exports = RunSessionModel;
