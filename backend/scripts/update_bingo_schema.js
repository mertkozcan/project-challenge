const pool = require('../config/db');

const updateSchema = async () => {
    try {
        console.log('Starting schema update...');

        // 1. Create bingo_tasks table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bingo_tasks (
                id SERIAL PRIMARY KEY,
                game_name VARCHAR(255) NOT NULL,
                task TEXT NOT NULL,
                difficulty VARCHAR(50) DEFAULT 'Normal',
                type VARCHAR(50) DEFAULT 'Standard',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Created bingo_tasks table.');

        // 2. Add columns to bingo_boards
        await pool.query(`
            ALTER TABLE bingo_boards 
            ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Normal',
            ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'Standard';
        `);
        console.log('Updated bingo_boards table.');

        console.log('Schema update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
};

updateSchema();
