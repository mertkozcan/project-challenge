const pool = require('../config/db');

const getAllBoards = async () => {
    const result = await pool.query('SELECT * FROM bingo_boards ORDER BY created_at DESC');
    return result.rows;
};

const getBoardById = async (boardId) => {
    const result = await pool.query('SELECT * FROM bingo_boards WHERE id = $1', [boardId]);
    return result.rows[0];
};

const getBoardCells = async (boardId) => {
    const result = await pool.query(
        'SELECT * FROM bingo_cells WHERE board_id = $1 ORDER BY row_index, col_index',
        [boardId]
    );
    return result.rows;
};

const getUserProgress = async (userId, boardId) => {
    const result = await pool.query(
        `SELECT ubp.*, bc.row_index, bc.col_index 
     FROM user_bingo_progress ubp
     JOIN bingo_cells bc ON ubp.cell_id = bc.id
     WHERE ubp.user_id = $1 AND bc.board_id = $2`,
        [userId, boardId]
    );
    return result.rows;
};

const submitCellProof = async (userId, cellId, proofUrl) => {
    const result = await pool.query(
        `INSERT INTO user_bingo_progress (user_id, cell_id, proof_url, status)
     VALUES ($1, $2, $3, 'PENDING')
     ON CONFLICT (user_id, cell_id) 
     DO UPDATE SET proof_url = $3, status = 'PENDING'
     RETURNING *`,
        [userId, cellId, proofUrl]
    );
    return result.rows[0];
};

const approveCellProof = async (progressId) => {
    const result = await pool.query(
        'UPDATE user_bingo_progress SET status = $1 WHERE id = $2 RETURNING *',
        ['APPROVED', progressId]
    );
    return result.rows[0];
};

const createBoard = async (gameName, title, description, size = 5) => {
    const result = await pool.query(
        'INSERT INTO bingo_boards (game_name, title, description, size) VALUES ($1, $2, $3, $4) RETURNING *',
        [gameName, title, description, size]
    );
    return result.rows[0];
};

const addCell = async (boardId, rowIndex, colIndex, task) => {
    const result = await pool.query(
        'INSERT INTO bingo_cells (board_id, row_index, col_index, task) VALUES ($1, $2, $3, $4) RETURNING *',
        [boardId, rowIndex, colIndex, task]
    );
    return result.rows[0];
};

module.exports = {
    getAllBoards,
    getBoardById,
    getBoardCells,
    getUserProgress,
    submitCellProof,
    approveCellProof,
    createBoard,
    addCell,
};
