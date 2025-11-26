const pool = require('../config/db');

const fixAdmin = async () => {
    try {
        console.log('Checking users...');
        const users = await pool.query("SELECT id, username, is_admin FROM users WHERE username IN ('rebelranger', 'elepred', 'EBA')");
        console.log('Current status:', users.rows);

        // Set rebelranger as admin if not already
        const targetUser = 'rebelranger';
        console.log(`Setting ${targetUser} as admin...`);

        await pool.query("UPDATE users SET is_admin = true WHERE username = $1", [targetUser]);

        const updated = await pool.query("SELECT id, username, is_admin FROM users WHERE username = $1", [targetUser]);
        console.log('Updated status:', updated.rows[0]);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixAdmin();
