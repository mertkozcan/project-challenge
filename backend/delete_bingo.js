const pool = require('./config/db');

const deleteBingoBoards = async () => {
    try {
        console.log('Deleting existing bingo boards...');
        await pool.query('DELETE FROM bingo_cells');
        await pool.query('DELETE FROM bingo_boards');
        console.log('Bingo boards deleted successfully!');
    } catch (error) {
        console.error('Error deleting bingo boards:', error);
    } finally {
        pool.end();
    }
};

deleteBingoBoards();
