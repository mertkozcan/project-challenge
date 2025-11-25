const pool = require('../config/db');

const userId = '485ecb0d-b6f2-400b-b397-d37d25a8cd1c';

async function checkProofs() {
    try {
        console.log('Checking proofs for user:', userId);
        const result = await pool.query(
            "SELECT * FROM proofs WHERE user_id = $1",
            [userId]
        );
        console.log('Proofs found:', result.rows);
    } catch (error) {
        console.error('Error checking proofs:', error);
    } finally {
        pool.end();
    }
}

checkProofs();
