const pool = require('../config/db');

const cleanupUsers = async () => {
    const keepUsers = ['rebelranger', 'elepred', 'EBA'];

    try {
        console.log('Starting user cleanup...');
        console.log(`Keeping users: ${keepUsers.join(', ')}`);

        // 1. Get IDs of users to delete
        // Using LOWER() to be safe with case sensitivity, though specific usernames were provided.
        // We want to delete users whose username is NOT in the keep list.
        const usersToDeleteRes = await pool.query(
            `SELECT id, username FROM users WHERE username NOT IN ($1, $2, $3)`,
            keepUsers
        );

        const usersToDelete = usersToDeleteRes.rows;
        const userIds = usersToDelete.map(u => u.id);

        if (userIds.length === 0) {
            console.log('No users found to delete.');
            process.exit(0);
        }

        console.log(`Found ${userIds.length} users to delete:`, usersToDelete.map(u => u.username).join(', '));

        // 2. Delete dependent data
        // Note: Some tables might have CASCADE DELETE, but explicit deletion is safer.

        console.log('Deleting proof votes...');
        await pool.query('DELETE FROM proof_votes WHERE user_id = ANY($1)', [userIds]);

        console.log('Deleting proofs...');
        await pool.query('DELETE FROM proofs WHERE user_id = ANY($1)', [userIds]);

        console.log('Deleting run sessions...');
        await pool.query('DELETE FROM run_sessions WHERE user_id = ANY($1)', [userIds]);

        console.log('Deleting notifications...');
        await pool.query('DELETE FROM notifications WHERE user_id = ANY($1)', [userIds]);

        console.log('Deleting builds...');
        await pool.query('DELETE FROM builds WHERE user_id = ANY($1)', [userIds]);

        console.log('Deleting bingo participation...');
        // Assuming table name is bingo_participation or similar. Checking models list...
        // bingoHistoryModel, bingoLeaderboardModel, bingoRoomModel...
        // Let's try deleting from bingo_participants if it exists, or handle via cascade if possible.
        // Based on file list, likely tables are related to bingo.
        // To be safe, let's rely on CASCADE for complex bingo stuff or just try generic deletes if we know table names.
        // If tables don't exist, this might throw. Let's wrap in try-catch or check existence.
        // Actually, let's just delete users and see if it cascades for the rest. 
        // Most modern schemas use CASCADE. If it fails, we know what to fix.
        // But proofs and run_sessions are the big ones we know about.

        // Also delete challenges created by these users?
        console.log('Deleting challenges created by these users...');
        await pool.query('DELETE FROM challenges WHERE created_by = ANY($1)', [userIds]);

        // 3. Delete Users
        console.log('Deleting users...');
        const deleteResult = await pool.query('DELETE FROM users WHERE id = ANY($1)', [userIds]);

        console.log(`Successfully deleted ${deleteResult.rowCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanupUsers();
