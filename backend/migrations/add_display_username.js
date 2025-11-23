require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function addDisplayUsernameColumn() {
    const client = await pool.connect();

    try {
        console.log('Adding display_username column to run_sessions table...');

        await client.query(`
      ALTER TABLE run_sessions 
      ADD COLUMN IF NOT EXISTS display_username VARCHAR(100);
    `);

        console.log('Creating index on display_username...');

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_run_sessions_display_username 
      ON run_sessions(display_username);
    `);

        console.log('✅ display_username column added successfully!');

    } catch (error) {
        console.error('❌ Error adding display_username column:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addDisplayUsernameColumn();
