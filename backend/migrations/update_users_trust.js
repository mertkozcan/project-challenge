require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateUsersTable() {
    const client = await pool.connect();

    try {
        console.log('Updating users table with trust system columns...');

        // Add trust system columns
        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS trust_level INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS approved_proofs_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS rejected_proofs_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS consecutive_rejections INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_untrusted BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS trust_earned_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_demotion_at TIMESTAMP;
    `);

        console.log('Creating indexes...');

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_trust_level ON users(trust_level);
      CREATE INDEX IF NOT EXISTS idx_users_is_untrusted ON users(is_untrusted);
    `);

        console.log('✅ users table updated successfully!');

    } catch (error) {
        console.error('❌ Error updating users table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

updateUsersTable();
