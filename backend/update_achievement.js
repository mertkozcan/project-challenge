const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function updateAchievement() {
    const client = await pool.connect();
    try {
        console.log('Updating Speed Demon achievement...');
        await client.query(`
      UPDATE achievements 
      SET threshold = 3600, description = 'Complete a solo bingo in under 1 hour'
      WHERE name = 'Speed Demon'
    `);
        console.log('Update successful');
    } catch (e) {
        console.error('Update failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

updateAchievement();
