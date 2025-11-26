const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        console.log('Reading extra migration file...');
        const migrationPath = path.join(__dirname, '../migrations/add_updated_at_extra.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing extra migration...');
        await pool.query(migrationSql);

        console.log('Extra migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
