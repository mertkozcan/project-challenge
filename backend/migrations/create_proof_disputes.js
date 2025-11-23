require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createProofDisputesTable() {
    const client = await pool.connect();

    try {
        console.log('Creating proof_disputes table...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS proof_disputes (
        id SERIAL PRIMARY KEY,
        proof_id UUID NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
        reporter_id UUID NOT NULL REFERENCES users(id),
        reason VARCHAR(50) NOT NULL, -- WRONG_NAME, NO_COMPLETION, SUSPICIOUS_EDIT, REUSED_FOOTAGE, OTHER
        description TEXT,
        status VARCHAR(20) DEFAULT 'OPEN', -- OPEN, RESOLVED, DISMISSED
        resolved_by UUID REFERENCES users(id),
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        console.log('Creating indexes for proof_disputes...');
        await client.query(`CREATE INDEX IF NOT EXISTS idx_proof_disputes_proof_id ON proof_disputes(proof_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_proof_disputes_status ON proof_disputes(status);`);

        console.log('✅ proof_disputes table created successfully!');

    } catch (error) {
        console.error('❌ Error creating proof_disputes table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createProofDisputesTable();
