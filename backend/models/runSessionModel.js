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

function generateGameUsername(gameName) {
    const wordPool = GAME_WORD_POOLS[gameName] || GAME_WORD_POOLS['Default'];
    const adjective = wordPool.adjectives[Math.floor(Math.random() * wordPool.adjectives.length)];
    const noun = wordPool.nouns[Math.floor(Math.random() * wordPool.nouns.length)];
    return `${adjective}${noun}`;
}

function generateRunCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '#';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const RunSessionModel = {
    createRunSession: async (userId, gameName, challengeType = 'permanent', challengeDeadline = null, challengeId = null, bingoBoardId = null) => {
        let runCode;
        let displayUsername;
        let attempts = 0;
        const maxAttempts = 20;

        // Only daily and weekly challenges have expiry
        // Permanent and bingo challenges have no time limit
        let expiresAt = null;
        if (challengeType === 'daily' || challengeType === 'weekly') {
            expiresAt = challengeDeadline || new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        while (attempts < maxAttempts) {
            runCode = generateRunCode();
            displayUsername = generateGameUsername(gameName);

            try {
                const result = await pool.query(
                    `INSERT INTO run_sessions (user_id, game_name, challenge_type, challenge_id, bingo_board_id, run_code, display_username, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
                    [userId, gameName, challengeType, challengeId, bingoBoardId, runCode, displayUsername, expiresAt]
                );

                return result.rows[0];
            } catch (error) {
                if (error.code === '23505') {
                    attempts++;
                    continue;
                }
                throw error;
            }
        }

        throw new Error('Failed to generate unique run session after multiple attempts');
    },

    getActiveSession: async (userId) => {
        const result = await pool.query(
            `SELECT * FROM run_sessions
       WHERE user_id = $1 
       AND status = 'ACTIVE'
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
       ORDER BY created_at DESC
       LIMIT 1`,
            [userId]
        );
        return result.rows[0] || null;
    },

    getSessionByCode: async (runCode) => {
        const result = await pool.query(
            'SELECT * FROM run_sessions WHERE run_code = $1',
            [runCode]
        );
        return result.rows[0] || null;
    },

    getSessionByUsername: async (displayUsername) => {
        const result = await pool.query(
            `SELECT * FROM run_sessions 
       WHERE display_username = $1 
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
       ORDER BY created_at DESC
       LIMIT 1`,
            [displayUsername]
        );
        return result.rows[0] || null;
    },

    validateRunCode: async (runCode, userId) => {
        const result = await pool.query(
            `SELECT id FROM run_sessions
       WHERE run_code = $1 
       AND user_id = $2
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
            [runCode, userId]
        );
        return result.rows.length > 0;
    },

    validateUsername: async (displayUsername, userId) => {
        const result = await pool.query(
            `SELECT id FROM run_sessions
       WHERE display_username = $1 
       AND user_id = $2
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
            [displayUsername, userId]
        );
        return result.rows.length > 0;
    },

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

    cleanupExpiredSessions: async () => {
        const result = await pool.query(
            `UPDATE run_sessions
       SET status = 'EXPIRED'
       WHERE expires_at < CURRENT_TIMESTAMP
       AND expires_at IS NOT NULL
       AND status = 'ACTIVE'
       RETURNING id, user_id, challenge_type`
        );
        return result.rows;
    },

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

    getGameWordPool: (gameName) => {
        return GAME_WORD_POOLS[gameName] || GAME_WORD_POOLS['Default'];
    }
};

module.exports = RunSessionModel;
