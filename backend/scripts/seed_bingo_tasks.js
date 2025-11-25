const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const tasks = [
    // Elden Ring
    { game: 'Elden Ring', task: 'Defeat Margit, the Fell Omen', difficulty: 'Normal', type: 'Boss' },
    { game: 'Elden Ring', task: 'Defeat Godrick the Grafted', difficulty: 'Normal', type: 'Boss' },
    { game: 'Elden Ring', task: 'Acquire a Great Rune', difficulty: 'Normal', type: 'Item' },
    { game: 'Elden Ring', task: 'Find a Stonesword Key', difficulty: 'Easy', type: 'Item' },
    { game: 'Elden Ring', task: "Defeat a Night's Cavalry", difficulty: 'Hard', type: 'Boss' },
    { game: 'Elden Ring', task: 'Acquire the Moonveil Katana', difficulty: 'Hard', type: 'Item' },
    { game: 'Elden Ring', task: 'Defeat an Erdtree Avatar', difficulty: 'Normal', type: 'Boss' },
    { game: 'Elden Ring', task: 'Visit Caelid', difficulty: 'Easy', type: 'Area' },
    { game: 'Elden Ring', task: 'Defeat Rennala, Queen of the Full Moon', difficulty: 'Normal', type: 'Boss' },
    { game: 'Elden Ring', task: 'Acquire a Legendary Armament', difficulty: 'Hard', type: 'Item' },
    { game: 'Elden Ring', task: 'Defeat Starscourge Radahn', difficulty: 'Hard', type: 'Boss' },
    { game: 'Elden Ring', task: 'Find the Dectus Medallion (Left & Right)', difficulty: 'Normal', type: 'Item' },
    { game: 'Elden Ring', task: 'Defeat Magma Wyrm Makar', difficulty: 'Normal', type: 'Boss' },
    { game: 'Elden Ring', task: 'Reach Altus Plateau', difficulty: 'Normal', type: 'Area' },
    { game: 'Elden Ring', task: 'Defeat Red Wolf of Radagon', difficulty: 'Normal', type: 'Boss' },
    { game: 'Elden Ring', task: 'Upgrade a weapon to +10 (Standard)', difficulty: 'Normal', type: 'Item' },
    { game: 'Elden Ring', task: 'Find a Sacred Tear', difficulty: 'Easy', type: 'Item' },
    { game: 'Elden Ring', task: 'Defeat Leonine Misbegotten', difficulty: 'Normal', type: 'Boss' },
    { game: 'Elden Ring', task: 'Acquire the Flask of Wondrous Physick', difficulty: 'Easy', type: 'Item' },
    { game: 'Elden Ring', task: 'Defeat Ancestor Spirit', difficulty: 'Normal', type: 'Boss' },
    { game: 'Elden Ring', task: 'Defeat Rykard, Lord of Blasphemy', difficulty: 'Hard', type: 'Boss' },
    { game: 'Elden Ring', task: 'Find the Mimic Tear Ashes', difficulty: 'Normal', type: 'Item' },
    { game: 'Elden Ring', task: 'Defeat Astel, Naturalborn of the Void', difficulty: 'Hard', type: 'Boss' },
    { game: 'Elden Ring', task: 'Reach Leyndell, Royal Capital', difficulty: 'Normal', type: 'Area' },
    { game: 'Elden Ring', task: 'Defeat Godfrey, First Elden Lord (Golden Shade)', difficulty: 'Normal', type: 'Boss' },
    { game: 'Elden Ring', task: 'Defeat Morgott, the Omen King', difficulty: 'Hard', type: 'Boss' },
    { game: 'Elden Ring', task: 'Find the Rold Medallion', difficulty: 'Easy', type: 'Item' },
    { game: 'Elden Ring', task: 'Defeat Fire Giant', difficulty: 'Hard', type: 'Boss' },
    { game: 'Elden Ring', task: 'Reach Crumbling Farum Azula', difficulty: 'Normal', type: 'Area' },
    { game: 'Elden Ring', task: 'Defeat Godskin Duo', difficulty: 'Hard', type: 'Boss' },
    { game: 'Elden Ring', task: 'Defeat Maliketh, the Black Blade', difficulty: 'Expert', type: 'Boss' },
    { game: 'Elden Ring', task: 'Defeat Sir Gideon Ofnir', difficulty: 'Normal', type: 'Boss' },
    { game: 'Elden Ring', task: 'Defeat Godfrey, First Elden Lord (Hoarah Loux)', difficulty: 'Hard', type: 'Boss' },
    { game: 'Elden Ring', task: 'Defeat Radagon of the Golden Order', difficulty: 'Expert', type: 'Boss' },
    { game: 'Elden Ring', task: 'Become Elden Lord', difficulty: 'Expert', type: 'Standard' },
];

const seedTasks = async () => {
    try {
        console.log('Seeding bingo tasks...');

        // Clear existing tasks to avoid duplicates and remove non-Elden Ring tasks
        await pool.query('DELETE FROM bingo_tasks');

        for (const t of tasks) {
            await pool.query(
                'INSERT INTO bingo_tasks (game_name, task, difficulty, type) VALUES ($1, $2, $3, $4)',
                [t.game, t.task, t.difficulty, t.type]
            );
        }

        console.log(`Successfully seeded ${tasks.length} tasks.`);
    } catch (error) {
        console.error('Error seeding tasks:', error);
    } finally {
        await pool.end();
    }
};

seedTasks();
