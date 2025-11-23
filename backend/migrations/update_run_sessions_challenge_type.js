require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateRunSessionsForChallengeTypes() {
    const client = await pool.connect();

    try {
        console.log('Adding challenge_type column to run_sessions...');

        await client.query(`
      ALTER TABLE run_sessions 
      ADD COLUMN IF NOT EXISTS challenge_type VARCHAR(20);
    `);

        console.log('Updating expires_at to allow NULL...');

        await client.query(`
      ALTER TABLE run_sessions 
      ALTER COLUMN expires_at DROP DEFAULT;
    `);

        console.log('✅ run_sessions updated for challenge types!');

    } catch (error) {
        console.error('❌ Error updating run_sessions:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

updateRunSessionsForChallengeTypes();
