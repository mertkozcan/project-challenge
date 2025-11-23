require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createRunSessionsTable() {
    const client = await pool.connect();

    try {
        console.log('Creating run_sessions table...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS run_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        bingo_board_id INTEGER REFERENCES bingo_boards(id) ON DELETE CASCADE,
        run_code VARCHAR(10) NOT NULL UNIQUE,
        game_name VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Creating indexes...');

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_run_sessions_user ON run_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_run_sessions_code ON run_sessions(run_code);
      CREATE INDEX IF NOT EXISTS idx_run_sessions_status ON run_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_run_sessions_expires ON run_sessions(expires_at);
    `);

        console.log('✅ run_sessions table created successfully!');

    } catch (error) {
        console.error('❌ Error creating run_sessions table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createRunSessionsTable();
