const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Running multiplayer bingo migration...');

        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'create_multiplayer_bingo.sql'),
            'utf8'
        );

        await pool.query(migrationSQL);

        console.log('✅ Migration completed successfully!');
        console.log('Created tables:');
        console.log('  - bingo_rooms');
        console.log('  - bingo_room_participants');
        console.log('  - bingo_cell_completions');
        console.log('  - bingo_invitations');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
