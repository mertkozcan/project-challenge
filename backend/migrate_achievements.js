const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTablesQuery = `
  CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'WINS', 'GAMES', 'STREAK', 'SPEED'
    threshold INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
  );
`;

const seedAchievementsQuery = `
  INSERT INTO achievements (name, description, icon, type, threshold, xp_reward)
  VALUES 
    ('First Blood', 'Win your first bingo game', '🩸', 'WINS', 1, 100),
    ('Bingo Master', 'Win 10 bingo games', '👑', 'WINS', 10, 500),
    ('Bingo Legend', 'Win 50 bingo games', '🏆', 'WINS', 50, 2000),
    ('Getting Started', 'Play 5 games', '🎮', 'GAMES', 5, 100),
    ('Dedicated Player', 'Play 50 games', '🕹️', 'GAMES', 50, 1000),
    ('On Fire', 'Achieve a win streak of 3', '🔥', 'STREAK', 3, 300),
    ('Unstoppable', 'Achieve a win streak of 5', '🚀', 'STREAK', 5, 1000),
    ('Speed Demon', 'Complete a solo bingo in under 1 hour', '⚡', 'SPEED', 3600, 500)
  ON CONFLICT DO NOTHING;
`;

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Creating achievements tables...');
    await client.query(createTablesQuery);

    console.log('Seeding initial achievements...');
    await client.query(seedAchievementsQuery);

    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
