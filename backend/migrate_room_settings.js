const { Pool } = require('pg');
require('dotenv').config();

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
        console.log('Adding is_private and password columns to bingo_rooms...');

        await pool.query(`
      ALTER TABLE bingo_rooms 
      ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS password TEXT DEFAULT NULL;
    `);

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
};

migrate();
