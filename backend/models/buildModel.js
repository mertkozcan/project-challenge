const pool = require('../config/db');

const createBuild = async (userId, gameName, buildName, description, itemsJson) => {
    const result = await pool.query(
        'INSERT INTO builds (user_id, game_name, build_name, description, items_json) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, gameName, buildName, description, itemsJson]
    );
    return result.rows[0];
};

const getBuildsByGame = async (gameName) => {
    const result = await pool.query(
        `SELECT builds.*, users.username, g.banner_url, g.icon_url as game_icon
         FROM builds 
         JOIN users ON builds.user_id = users.id 
         LEFT JOIN games g ON builds.game_name = g.name
         WHERE builds.game_name = $1 
         ORDER BY builds.created_at DESC`,
        [gameName]
    );
    return result.rows;
};

const getBuildById = async (id) => {
    const result = await pool.query(
        `SELECT builds.*, users.username, g.banner_url, g.icon_url as game_icon
         FROM builds 
         JOIN users ON builds.user_id = users.id
         LEFT JOIN games g ON builds.game_name = g.name
         WHERE builds.id = $1`,
        [id]
    );
    return result.rows[0];
};

const getAllBuilds = async (contentType) => {
    let query = `
        SELECT builds.*, users.username, g.banner_url, g.icon_url as game_icon
        FROM builds 
        JOIN users ON builds.user_id = users.id 
        LEFT JOIN games g ON builds.game_name = g.name
        WHERE 1=1
    `;

    if (contentType === 'official') {
        query += ' AND builds.is_official = true';
    } else if (contentType === 'community') {
        query += ' AND builds.is_official = false';
    }

    query += ' ORDER BY builds.created_at DESC';

    const result = await pool.query(query);
    return result.rows;
}

module.exports = { createBuild, getBuildsByGame, getBuildById, getAllBuilds };
