require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        const migrationPath = path.join(__dirname, '../migrations/add_challenge_id_to_user_bingo_runs.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running migration...');
        await client.query(migrationSql);
        console.log('Migration completed successfully!');

        client.release();
    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        await pool.end();
    }
}

runMigration();
