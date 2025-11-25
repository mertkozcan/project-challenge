const pool = require('../config/db');

async function fixProofStatus() {
    try {
        console.log('Fixing null status for proofs...');
        const result = await pool.query(
            "UPDATE proofs SET status = 'PENDING' WHERE status IS NULL"
        );
        console.log(`Updated ${result.rowCount} proofs.`);
    } catch (error) {
        console.error('Error fixing proofs:', error);
    } finally {
        pool.end();
    }
}

fixProofStatus();
