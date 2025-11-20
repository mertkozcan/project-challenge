const {
    getAllBoards,
    getBoardById,
    getBoardCells,
    getUserProgress,
    submitCellProof,
    approveCellProof,
    createBoard,
    addCell,
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
        const progress = await getUserProgress(userId, id);

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

        res.json({ board, cells: cellsWithProgress });
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
    const { game_name, title, description, size, cells } = req.body;

    try {
        const board = await createBoard(game_name, title, description, size);

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

module.exports = { getBoards, getBoardDetail, submitProof, approveProof, createNewBoard, upload };
