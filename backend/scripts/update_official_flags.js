const pool = require('../config/db');

const updateOfficialFlags = async () => {
    try {
        console.log('Starting official flag update...');

        // 0. Fix Schema: Add is_official to bingo_boards if missing
        try {
            await pool.query('ALTER TABLE bingo_boards ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE');
            console.log('✅ Added is_official column to bingo_boards (if it didn\'t exist)');
        } catch (e) {
            console.error('Error adding column to bingo_boards:', e.message);
        }

        // 0.1 Fix Schema: Add is_official to builds if missing (just in case)
        try {
            await pool.query('ALTER TABLE builds ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE');
            console.log('✅ Added is_official column to builds (if it didn\'t exist)');
        } catch (e) {
            console.error('Error adding column to builds:', e.message);
        }

        // 1. Find Admin Users
        const adminUsersResult = await pool.query("SELECT id, username FROM users WHERE is_admin = true OR username = 'admin'");
        const adminUsers = adminUsersResult.rows;
        const adminIds = adminUsers.map(u => u.id);

        console.log('Found Admin Users:', adminUsers.map(u => `${u.username} (${u.id})`));

        if (adminIds.length === 0) {
            console.log('No admin users found. Cannot update records.');
            return;
        }

        // 2. Update Challenges
        const challengesResult = await pool.query(`
      UPDATE challenges 
      SET is_official = true 
      WHERE created_by = ANY($1) AND is_official IS NOT true
      RETURNING id, challenge_name
    `, [adminIds]);
        console.log(`Updated ${challengesResult.rowCount} Challenges to Official.`);

        // 3. Update Builds
        const buildsResult = await pool.query(`
      UPDATE builds 
      SET is_official = true 
      WHERE user_id = ANY($1) AND is_official IS NOT true
      RETURNING id, build_name
    `, [adminIds]);
        console.log(`Updated ${buildsResult.rowCount} Builds to Official.`);

        // 4. Update Bingo Boards
        // Only check for admin IDs since created_by is UUID
        const bingoResult = await pool.query(`
      UPDATE bingo_boards 
      SET is_official = true 
      WHERE created_by = ANY($1) AND is_official IS NOT true
      RETURNING id, title
    `, [adminIds]);

        console.log(`Updated ${bingoResult.rowCount} Bingo Boards to Official.`);

    } catch (error) {
        console.error('Error updating flags:', error);
    } finally {
        await pool.end();
    }
};

updateOfficialFlags();
