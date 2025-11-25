const pool = require('../config/db');

const getAllBoards = async () => {
    const result = await pool.query('SELECT * FROM bingo_boards ORDER BY created_at DESC');
    return result.rows;
};

const getBoardById = async (boardId) => {
    const result = await pool.query(
        `SELECT bb.*, g.banner_url, g.icon_url as game_icon
         FROM bingo_boards bb
         LEFT JOIN games g ON bb.game_name = g.name
         WHERE bb.id = $1`,
        [boardId]
    );
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

const createBoard = async (gameName, title, description, size = 5, type = 'Normal', theme = 'Standard') => {
    const result = await pool.query(
        'INSERT INTO bingo_boards (game_name, title, description, size, type, theme) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [gameName, title, description, size, type, theme]
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

// Bingo Tasks Functions
const createBingoTask = async (gameName, task, difficulty = 'Normal', type = 'Standard') => {
    const result = await pool.query(
        'INSERT INTO bingo_tasks (game_name, task, difficulty, type) VALUES ($1, $2, $3, $4) RETURNING *',
        [gameName, task, difficulty, type]
    );
    return result.rows[0];
};

const getBingoTasks = async (gameName) => {
    const result = await pool.query(
        'SELECT * FROM bingo_tasks WHERE game_name = $1 ORDER BY created_at DESC',
        [gameName]
    );
    return result.rows;
};

const deleteBingoTask = async (id) => {
    const result = await pool.query(
        'DELETE FROM bingo_tasks WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};

const getRandomBingoTasks = async (gameName, count) => {
    const result = await pool.query(
        'SELECT * FROM bingo_tasks WHERE game_name = $1 ORDER BY RANDOM() LIMIT $2',
        [gameName, count]
    );
    return result.rows;
};

// User Bingo Runs functions
const getUserRun = async (userId, boardId) => {
    const result = await pool.query(
        'SELECT * FROM user_bingo_runs WHERE user_id = $1 AND board_id = $2',
        [userId, boardId]
    );
    return result.rows[0] || null;
};

const updateRunTime = async (userId, boardId, elapsedTime) => {
    const result = await pool.query(
        `INSERT INTO user_bingo_runs (user_id, board_id, elapsed_time, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, board_id)
         DO UPDATE SET elapsed_time = $3, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, boardId, elapsedTime]
    );
    return result.rows[0];
};

const finishRun = async (userId, boardId, elapsedTime) => {
    const result = await pool.query(
        `INSERT INTO user_bingo_runs (user_id, board_id, is_finished, elapsed_time, finished_at, updated_at)
         VALUES ($1, $2, TRUE, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, board_id)
         DO UPDATE SET is_finished = TRUE, elapsed_time = $3, finished_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [userId, boardId, elapsedTime]
    );
    return result.rows[0];
};

const resetRun = async (userId, boardId) => {
    const result = await pool.query(
        'DELETE FROM user_bingo_runs WHERE user_id = $1 AND board_id = $2 RETURNING *',
        [userId, boardId]
    );
    return result.rows[0] || null;
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
    getUserRun,
    updateRunTime,
    finishRun,
    resetRun,
    createBingoTask,
    getBingoTasks,
    deleteBingoTask,
    getRandomBingoTasks,
};
