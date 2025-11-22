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

console.log('DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const grantAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await pool.connect();

        const username = 'rebelranger';
        console.log(`Granting admin role to user: ${username}...`);

        // Update is_admin column
        const result = await pool.query(`
            UPDATE users 
            SET is_admin = true 
            WHERE username = $1
            RETURNING *;
        `, [username]);

        if (result.rows.length > 0) {
            console.log('Success! User updated:', result.rows[0]);
        } else {
            console.log('User not found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Operation failed:', err);
        process.exit(1);
    }
};

grantAdmin();
