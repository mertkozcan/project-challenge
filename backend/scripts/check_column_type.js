const pool = require('../config/db');

const checkColumnType = async () => {
    try {
        console.log('Checking column type...');
        const result = await pool.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'bingo_boards' AND column_name = 'created_by'
    `);
        console.log('created_by type:', result.rows[0]?.data_type);
    } catch (error) {
        console.error('Error checking column type:', error);
    } finally {
        await pool.end();
    }
};

checkColumnType();
