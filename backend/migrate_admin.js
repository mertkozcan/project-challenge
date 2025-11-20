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

        console.log('Creating games table...');
        await pool.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        icon_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Adding is_official and created_by to challenges...');
        await pool.query(`
      ALTER TABLE challenges 
      ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
    `);

        console.log('Adding is_official to builds...');
        await pool.query(`
      ALTER TABLE builds 
      ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
    `);

        console.log('Adding is_admin to users...');
        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
    `);

        console.log('Migration completed: Content separation ready.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
