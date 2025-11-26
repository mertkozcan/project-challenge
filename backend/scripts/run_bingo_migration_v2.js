const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        console.log('Reading migration file...');
        const migrationPath = path.join(__dirname, '../migrations/add_created_by_to_bingo_v2.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing migration...');
        await pool.query(migrationSql);

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
