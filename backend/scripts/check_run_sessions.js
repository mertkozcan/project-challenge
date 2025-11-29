require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkSchema() {
    try {
        const client = await pool.connect();
        console.log('Connected to database');

        const table = 'run_sessions';
        console.log(`\nChecking table: ${table}`);
        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [table]);

        if (res.rows.length === 0) {
            console.log(`Table ${table} does not exist!`);
        } else {
            res.rows.forEach(row => {
                console.log(` - ${row.column_name} (${row.data_type})`);
            });
        }

        client.release();
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
