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
        console.log('Changing notifications.related_id from INTEGER to TEXT...');

        await pool.query(`
      ALTER TABLE notifications 
      ALTER COLUMN related_id TYPE TEXT USING related_id::TEXT;
    `);

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
};

migrate();
