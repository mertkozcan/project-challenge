require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function cleanupSessions() {
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        console.log('Cleaning up malformed sessions...');

        // Find sessions where challenge_type is a number (meaning it was incorrectly set to challenge_id)
        // and challenge_id is NULL
        const res = await client.query(`
      UPDATE run_sessions
      SET challenge_id = challenge_type::integer,
          challenge_type = 'permanent'
      WHERE challenge_type ~ '^[0-9]+$' 
      AND challenge_id IS NULL
      RETURNING id, user_id, challenge_id, challenge_type
    `);

        console.log(`Fixed ${res.rowCount} sessions.`);
        res.rows.forEach(row => {
            console.log(` - Fixed session ${row.id}: challenge_id set to ${row.challenge_id}`);
        });

        client.release();
    } catch (err) {
        console.error('Error cleaning up sessions:', err);
    } finally {
        await pool.end();
    }
}

cleanupSessions();
