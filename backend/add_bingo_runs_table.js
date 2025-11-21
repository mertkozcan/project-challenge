const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false,
    },
});

const migrate = async () => {
    try {
        console.log('Connecting to database...');
        await pool.connect();

        console.log('Creating user_bingo_runs table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS user_bingo_runs (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        board_id INTEGER REFERENCES bingo_boards(id) ON DELETE CASCADE,
        is_finished BOOLEAN DEFAULT FALSE,
        elapsed_time INTEGER DEFAULT 0,
        finished_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, board_id)
      );
    `);

        console.log('Creating index on user_id and board_id...');
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_bingo_runs_user_board 
      ON user_bingo_runs(user_id, board_id);
    `);

        console.log('Migration completed: user_bingo_runs table created.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
