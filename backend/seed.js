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

const seed = async () => {
    try {
        await pool.connect();
        console.log('Connected.');

        // Create Test User
        const userRes = await pool.query(
            `INSERT INTO users (username, email, password_hash, avatar_url) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email 
       RETURNING *`,
            ['testuser', 'test@example.com', 'hashedpassword123', 'https://via.placeholder.com/150']
        );
        console.log('Test User Created/Updated:', userRes.rows[0]);

        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
};

seed();
