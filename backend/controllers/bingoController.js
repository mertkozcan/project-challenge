const {
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
} = require('../models/bingoModel');
const multer = require('multer');
const path = require('path');

// Multer Configuration (reuse from proofs)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

const getBoards = async (req, res) => {
    try {
        const boards = await getAllBoards();
        res.json(boards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBoardDetail = async (req, res) => {
    const { id } = req.params;
    const userId = req.query.user_id;

    try {
        const board = await getBoardById(id);
        if (!board) return res.status(404).json({ error: 'Board not found' });

        const cells = await getBoardCells(id);
        // Guest users (empty userId) get empty progress
        const progress = userId ? await getUserProgress(userId, id) : [];

        // Merge cells with user progress
        const cellsWithProgress = cells.map((cell) => {
            const userCell = progress.find((p) => p.cell_id === cell.id);
            return {
                ...cell,
                status: userCell ? userCell.status : null,
                proof_url: userCell ? userCell.proof_url : null,
                progress_id: userCell ? userCell.id : null,
            };
        });

        // Get user's run state (guests don't have runs)
        const run = userId ? await getUserRun(userId, id) : null;
        console.log('getUserRun result:', { userId, boardId: id, run });

        res.json({
            board,
            cells: cellsWithProgress,
            run: run || { is_finished: false, elapsed_time: 0, finished_at: null }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const submitProof = async (req, res) => {
    const { cellId } = req.params;
    const { user_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const proofUrl = `/uploads/${file.filename}`;

    try {
        const proof = await submitCellProof(user_id, cellId, proofUrl);
        res.status(201).json(proof);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const approveProof = async (req, res) => {
    const { progressId } = req.params;

    try {
        const approved = await approveCellProof(progressId);
        res.json(approved);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createNewBoard = async (req, res) => {
    const { game_name, title, description, size, type, theme, cells, created_by } = req.body;

    try {
        const board = await createBoard(game_name, title, description, size, type, theme, created_by);

        // Add cells if provided
        if (cells && Array.isArray(cells)) {
            for (const cell of cells) {
                await addCell(board.id, cell.row, cell.col, cell.task);
            }
        }

        res.status(201).json(board);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const completeCellDirect = async (req, res) => {
    const { cellId } = req.params;
    const { user_id } = req.body;

    try {
        // Directly approve the cell without proof
        const result = await submitCellProof(user_id, cellId, null);
        await approveCellProof(result.id);
        res.json({ message: 'Cell completed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const resetBoardProgress = async (req, res) => {
    const { boardId } = req.params;
    const { user_id } = req.body;

    try {
        const pool = require('../config/db');

        // Delete all progress for this user and board
        await pool.query(
            'DELETE FROM user_bingo_progress WHERE user_id = $1 AND cell_id IN (SELECT id FROM bingo_cells WHERE board_id = $2)',
            [user_id, boardId]
        );

        // Also reset the run state
        await resetRun(user_id, boardId);

        res.json({ message: 'Board progress reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const finishBingoRun = async (req, res) => {
    const { user_id, board_id, elapsed_time } = req.body;
    console.log('finishBingoRun called:', { user_id, board_id, elapsed_time });

    try {
        const run = await finishRun(user_id, board_id, elapsed_time);
        console.log('finishRun result:', run);

        // Check for achievements
        try {
            const { checkAndUnlockAchievements } = require('../models/achievementModel');
            const unlocked = await checkAndUnlockAchievements(user_id, elapsed_time);
            if (unlocked.length > 0) {
                run.new_achievements = unlocked;
            }
        } catch (achError) {
            console.error('Error checking achievements:', achError);
        }

        res.json(run);
    } catch (error) {
        console.error('finishBingoRun error:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateBingoRunTime = async (req, res) => {
    const { user_id, board_id, elapsed_time } = req.body;

    try {
        const run = await updateRunTime(user_id, board_id, elapsed_time);
        res.json(run);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's solo bingo history
const getSoloHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { getUserSoloHistory } = require('../models/bingoHistoryModel');
        const history = await getUserSoloHistory(userId);
        res.json(history);
    } catch (error) {
        console.error('Error getting solo history:', error);
        res.status(500).json({ error: 'Failed to get solo history' });
    }
};

// Get user's bingo statistics
const getBingoStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const { getUserBingoStats } = require('../models/bingoHistoryModel');
        const stats = await getUserBingoStats(userId);
        res.json(stats);
    } catch (error) {
        console.error('Error getting bingo stats:', error);
        res.status(500).json({ error: 'Failed to get bingo stats' });
    }
};

// --- Bingo Task Management ---

const addTask = async (req, res) => {
    const { game_name, task, difficulty, type } = req.body;
    try {
        const newTask = await createBingoTask(game_name, task, difficulty, type);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTasks = async (req, res) => {
    const { game } = req.query;
    if (!game) return res.status(400).json({ error: 'Game name is required' });

    try {
        const tasks = await getBingoTasks(game);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteBingoTask(id);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRandomTasks = async (req, res) => {
    const { game, count } = req.query;
    if (!game) return res.status(400).json({ error: 'Game name is required' });

    try {
        const tasks = await getRandomBingoTasks(game, parseInt(count) || 25);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getBoards,
    getBoardDetail,
    submitProof,
    approveProof,
    createNewBoard,
    upload,
    completeCellDirect,
    resetBoardProgress,
    finishBingoRun,
    updateBingoRunTime,
    getSoloHistory,
    getBingoStats,
    addTask,
    getTasks,
    deleteTask,
    getRandomTasks,
};

const updateBoard = async (req, res) => {
    const { id } = req.params;
    const { game_name, title, description, size, type, theme } = req.body;

    try {
        const { updateBoard: updateBoardModel } = require('../models/bingoModel');
        const updatedBoard = await updateBoardModel(id, {
            game_name, title, description, size, type, theme
        });

        if (!updatedBoard) {
            return res.status(404).json({ error: 'Board not found' });
        }

        res.json(updatedBoard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getBoards,
    getBoardDetail,
    submitProof,
    approveProof,
    createNewBoard,
    updateBoard,
    upload,
    completeCellDirect,
    resetBoardProgress,
    finishBingoRun,
    updateBingoRunTime,
    getSoloHistory,
    getBingoStats,
    addTask,
    getTasks,
    deleteTask,
    getRandomTasks,
};
