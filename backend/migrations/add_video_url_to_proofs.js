require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function addVideoUrlToProofs() {
    const client = await pool.connect();

    try {
        console.log('Adding video_url column to proofs table...');

        await client.query(`
      ALTER TABLE proofs 
      ADD COLUMN IF NOT EXISTS video_url TEXT;
    `);

        console.log('✅ video_url column added successfully!');

    } catch (error) {
        console.error('❌ Error updating proofs table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addVideoUrlToProofs();
