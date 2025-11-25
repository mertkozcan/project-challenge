const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runCleanup() {
    const client = await pool.connect();

    try {
        console.log('🗑️  Starting cleanup of non-Elden Ring game data...\n');

        // Read the SQL file
        const sqlPath = path.join(__dirname, 'cleanup_non_elden_ring_data.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the cleanup
        const result = await client.query(sql);

        console.log('✅ Cleanup completed successfully!\n');
        console.log('📊 Verification Results:');
        console.log('========================');

        // The last query in the SQL file returns verification results
        if (result && result.length > 0) {
            const lastResult = result[result.length - 1];
            if (lastResult.rows) {
                lastResult.rows.forEach(row => {
                    console.log(`${row.table_name}: ${row.count} records`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runCleanup();
