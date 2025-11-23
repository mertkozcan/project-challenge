const pool = require('../config/db');

const createBingoInvitationsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bingo_invitations (
                id SERIAL PRIMARY KEY,
                room_id INTEGER NOT NULL REFERENCES bingo_rooms(id) ON DELETE CASCADE,
                from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(room_id, to_user_id) -- Prevent duplicate invites to same room
            );
        `);
        console.log('✅ bingo_invitations table created/verified successfully!');
    } catch (error) {
        console.error('❌ Error creating bingo_invitations table:', error);
    } finally {
        pool.end();
    }
};

createBingoInvitationsTable();
