const pool = require('../config/db');

const checkSchema = async () => {
    try {
        console.log('Checking schema...');

        // Check users table for role
        try {
            await pool.query('SELECT role FROM users LIMIT 1');
            console.log('✅ users.role exists');
        } catch (e) {
            console.log('❌ users.role MISSING:', e.message);
        }

        // Check bingo_boards for is_official
        try {
            await pool.query('SELECT is_official FROM bingo_boards LIMIT 1');
            console.log('✅ bingo_boards.is_official exists');
        } catch (e) {
            console.log('❌ bingo_boards.is_official MISSING:', e.message);
        }

        // Check challenges for is_official
        try {
            await pool.query('SELECT is_official FROM challenges LIMIT 1');
            console.log('✅ challenges.is_official exists');
        } catch (e) {
            console.log('❌ challenges.is_official MISSING:', e.message);
        }

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await pool.end();
    }
};

checkSchema();
