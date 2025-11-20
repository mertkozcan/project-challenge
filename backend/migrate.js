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

const createTablesQuery = `
-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Challenges Table (Updated)
CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    game_name VARCHAR(255) NOT NULL,
    challenge_name VARCHAR(255) NOT NULL,
    description TEXT,
    reward VARCHAR(255),
    type VARCHAR(50) DEFAULT 'permanent', -- 'daily', 'weekly', 'permanent'
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Builds Table
CREATE TABLE IF NOT EXISTS builds (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_name VARCHAR(255) NOT NULL,
    build_name VARCHAR(255) NOT NULL,
    description TEXT,
    items_json JSONB, -- Stores items, stats, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proofs Table
CREATE TABLE IF NOT EXISTS proofs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20), -- 'image', 'video'
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const migrate = async () => {
    try {
        console.log('Connecting to database...');
        await pool.connect();
        console.log('Connected. Running migration...');
        await pool.query(createTablesQuery);
        console.log('Migration completed successfully: All tables created.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
