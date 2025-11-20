const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false,
    },
});

const migrate = async () => {
    try {
        console.log('Connecting to database...');
        await pool.connect();
        console.log('Connected. Running migration...');

        // Add score column to proofs if it doesn't exist
        await pool.query(`
      ALTER TABLE proofs 
      ADD COLUMN IF NOT EXISTS score NUMERIC DEFAULT 0;
    `);

        console.log('Migration completed: Added "score" column to "proofs" table.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
