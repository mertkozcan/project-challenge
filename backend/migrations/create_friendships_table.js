require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createFriendshipsTable() {
    const client = await pool.connect();

    try {
        console.log('Creating friendships table...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        friend_id UUID NOT NULL REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED, BLOCKED
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id),
        CHECK (user_id != friend_id)
      );

      CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
      CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
    `);

        console.log('✅ Friendships table created successfully!');

    } catch (error) {
        console.error('❌ Error creating friendships table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createFriendshipsTable();
