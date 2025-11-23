require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function addTrustColumnsToUsers() {
    const client = await pool.connect();

    try {
        console.log('Adding trust system columns to users table...');

        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS trust_level INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS approved_proofs_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS rejected_proofs_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS consecutive_rejections INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS trust_earned_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_demotion_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS is_untrusted BOOLEAN DEFAULT FALSE;
    `);

        console.log('✅ Trust system columns added successfully!');

    } catch (error) {
        console.error('❌ Error updating users table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addTrustColumnsToUsers();
