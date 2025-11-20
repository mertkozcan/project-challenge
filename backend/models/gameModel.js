const pool = require('../config/db');

const getAllGames = async () => {
    const result = await pool.query('SELECT * FROM games ORDER BY name ASC');
    return result.rows;
};

const getGameById = async (id) => {
    const result = await pool.query('SELECT * FROM games WHERE id = $1', [id]);
    return result.rows[0];
};

const createGame = async (name, description, iconUrl) => {
    const result = await pool.query(
        'INSERT INTO games (name, description, icon_url) VALUES ($1, $2, $3) RETURNING *',
        [name, description, iconUrl]
    );
    return result.rows[0];
};

const updateGame = async (id, name, description, iconUrl) => {
    const result = await pool.query(
        'UPDATE games SET name = $1, description = $2, icon_url = $3 WHERE id = $4 RETURNING *',
        [name, description, iconUrl, id]
    );
    return result.rows[0];
};

const deleteGame = async (id) => {
    await pool.query('DELETE FROM games WHERE id = $1', [id]);
};

module.exports = { getAllGames, getGameById, createGame, updateGame, deleteGame };
