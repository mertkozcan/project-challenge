const pool = require('../config/db');

const verifyData = async () => {
    try {
        const gamesCount = await pool.query('SELECT COUNT(*) FROM games');
        const tasksCount = await pool.query('SELECT COUNT(*) FROM bingo_tasks');

        console.log(`Total Games: ${gamesCount.rows[0].count}`);
        console.log(`Total Bingo Tasks: ${tasksCount.rows[0].count}`);

        const games = await pool.query('SELECT name FROM games ORDER BY name');
        console.log('Games list:', games.rows.map(g => g.name).join(', '));

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyData();
