const pool = require('./config/db');

const checkData = async () => {
    try {
        const games = await pool.query('SELECT COUNT(*) FROM games');
        console.log('Games count:', games.rows[0].count);

        const challenges = await pool.query('SELECT COUNT(*) FROM challenges');
        console.log('Challenges count:', challenges.rows[0].count);

        const builds = await pool.query('SELECT COUNT(*) FROM builds');
        console.log('Builds count:', builds.rows[0].count);

        const bingos = await pool.query('SELECT COUNT(*) FROM bingo_boards');
        console.log('Bingo Boards count:', bingos.rows[0].count);

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        pool.end();
    }
};

checkData();
