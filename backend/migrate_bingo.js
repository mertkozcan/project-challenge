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

        console.log('Creating bingo_boards table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS bingo_boards (
        id SERIAL PRIMARY KEY,
        game_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        size INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Creating bingo_cells table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS bingo_cells (
        id SERIAL PRIMARY KEY,
        board_id INTEGER REFERENCES bingo_boards(id) ON DELETE CASCADE,
        row_index INTEGER NOT NULL,
        col_index INTEGER NOT NULL,
        task TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Creating user_bingo_progress table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS user_bingo_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        cell_id INTEGER REFERENCES bingo_cells(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
        proof_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, cell_id)
      );
    `);

        console.log('Migration completed: Bingo tables created.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
