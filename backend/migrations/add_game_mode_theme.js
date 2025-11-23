const pool = require('../config/db');

const addGameModeAndTheme = async () => {
    try {
        await pool.query(`
            ALTER TABLE bingo_rooms
            ADD COLUMN IF NOT EXISTS game_mode VARCHAR(20) DEFAULT 'STANDARD',
            ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'DEFAULT';
        `);
        console.log('✅ Added game_mode and theme columns to bingo_rooms');
    } catch (error) {
        console.error('❌ Error adding columns:', error);
    } finally {
        pool.end();
    }
};

addGameModeAndTheme();
