require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function addPrivateRoomColumns() {
    const client = await pool.connect();

    try {
        console.log('Adding private room columns to bingo_rooms table...');

        await client.query(`
      ALTER TABLE bingo_rooms 
      ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS password VARCHAR(100);
    `);

        console.log('✅ Private room columns added successfully!');

    } catch (error) {
        console.error('❌ Error adding columns:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addPrivateRoomColumns();
