const pool = require('../config/db');

const userId = '485ecb0d-b6f2-400b-b397-d37d25a8cd1c';

async function clearSession() {
    try {
        console.log('Clearing active session for user:', userId);
        const result = await pool.query(
            "DELETE FROM run_sessions WHERE user_id = $1 AND status = 'ACTIVE'",
            [userId]
        );
        console.log(`Deleted ${result.rowCount} active session(s).`);
    } catch (error) {
        console.error('Error clearing session:', error);
    } finally {
        pool.end();
    }
}

clearSession();
