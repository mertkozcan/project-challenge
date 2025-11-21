const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function cleanupTestRooms() {
    try {
        console.log('🧹 Cleaning up test bingo rooms...');

        // Delete all waiting rooms
        const result = await pool.query(`
      DELETE FROM bingo_rooms 
      WHERE status = 'WAITING'
      RETURNING id, board_title
    `);

        console.log(`✅ Deleted ${result.rowCount} waiting rooms:`);
        result.rows.forEach(room => {
            console.log(`  - ${room.board_title} (${room.id})`);
        });

        console.log('✨ Cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error cleaning up rooms:', error);
        process.exit(1);
    }
}

cleanupTestRooms();
