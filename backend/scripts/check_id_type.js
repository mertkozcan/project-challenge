const pool = require('../config/db');

const checkIdType = async () => {
    try {
        console.log('Checking id column type...');
        const result = await pool.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'bingo_boards' AND column_name = 'id'
    `);
        console.log('id type:', result.rows[0]?.data_type);
    } catch (error) {
        console.error('Error checking column type:', error);
    } finally {
        await pool.end();
    }
};

checkIdType();
