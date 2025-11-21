const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function addWinColumns() {
    try {
        console.log('🔄 Adding win_type and win_index columns to bingo_rooms...');

        await pool.query(`
      ALTER TABLE bingo_rooms 
      ADD COLUMN IF NOT EXISTS win_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS win_index INTEGER
    `);

        console.log('✅ Columns added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding columns:', error);
        process.exit(1);
    }
}

addWinColumns();
