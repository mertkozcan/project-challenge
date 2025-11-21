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
        console.log('Creating bingo_invitations table...');

        await pool.query(`
      CREATE TABLE IF NOT EXISTS bingo_invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id UUID REFERENCES bingo_rooms(id) ON DELETE CASCADE,
        from_user_id UUID REFERENCES users(id),
        to_user_id UUID REFERENCES users(id),
        status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
};

migrate();
