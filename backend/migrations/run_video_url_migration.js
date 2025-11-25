require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('Running migration: add_video_url_to_builds...');

        const sqlPath = path.join(__dirname, 'add_video_url_to_builds.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);

        console.log('✅ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Error during migration:', error.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
