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

        console.log('Adding bingo streak tracking columns to users table...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS current_bingo_streak INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS best_bingo_streak INTEGER DEFAULT 0;
        `);

        console.log('Migration completed: Bingo leaderboard columns added.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
