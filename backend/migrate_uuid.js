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

        console.log('Enabling UUID extension...');
        await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        console.log('Dropping dependent tables...');
        await pool.query('DROP TABLE IF EXISTS user_bingo_progress CASCADE;');
        await pool.query('DROP TABLE IF EXISTS proofs CASCADE;');
        await pool.query('DROP TABLE IF EXISTS builds CASCADE;');
        await pool.query('DROP TABLE IF EXISTS challenges CASCADE;');
        await pool.query('DROP TABLE IF EXISTS bingo_cells CASCADE;');
        await pool.query('DROP TABLE IF EXISTS bingo_boards CASCADE;');

        console.log('Dropping and recreating users table with UUID...');
        await pool.query('DROP TABLE IF EXISTS users CASCADE;');
        await pool.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        avatar_url TEXT,
        points INTEGER DEFAULT 0,
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Recreating challenges table...');
        await pool.query(`
      CREATE TABLE challenges (
        id SERIAL PRIMARY KEY,
        game_name VARCHAR(255) NOT NULL,
        challenge_name VARCHAR(255) NOT NULL,
        description TEXT,
        reward VARCHAR(100),
        type VARCHAR(50) DEFAULT 'permanent',
        end_date TIMESTAMP,
        is_official BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Recreating builds table...');
        await pool.query(`
      CREATE TABLE builds (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        game_name VARCHAR(255) NOT NULL,
        build_name VARCHAR(255) NOT NULL,
        description TEXT,
        items_json JSONB,
        is_official BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Recreating proofs table...');
        await pool.query(`
      CREATE TABLE proofs (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
        media_url TEXT,
        media_type VARCHAR(20),
        status VARCHAR(20) DEFAULT 'PENDING',
        score NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Recreating bingo tables...');
        await pool.query(`
      CREATE TABLE bingo_boards (
        id SERIAL PRIMARY KEY,
        game_name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        size INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        await pool.query(`
      CREATE TABLE bingo_cells (
        id SERIAL PRIMARY KEY,
        board_id INTEGER REFERENCES bingo_boards(id) ON DELETE CASCADE,
        row_index INTEGER NOT NULL,
        col_index INTEGER NOT NULL,
        task TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        await pool.query(`
      CREATE TABLE user_bingo_progress (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        cell_id INTEGER REFERENCES bingo_cells(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'PENDING',
        proof_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, cell_id)
      );
    `);

        console.log('Migration completed: All tables recreated with UUID support.');
        console.log('Note: All existing data has been cleared.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
