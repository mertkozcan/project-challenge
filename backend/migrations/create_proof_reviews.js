require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createProofReviewsTable() {
    const client = await pool.connect();

    try {
        console.log('Creating proof_reviews table...');

        await client.query(`
      CREATE TABLE IF NOT EXISTS proof_reviews (
        id SERIAL PRIMARY KEY,
        proof_id UUID NOT NULL REFERENCES proofs(id) ON DELETE CASCADE,
        reviewer_id UUID NOT NULL REFERENCES users(id),
        decision VARCHAR(20) NOT NULL, -- 'APPROVE', 'REJECT'
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(proof_id, reviewer_id) -- One review per user per proof
      );
    `);

        console.log('Creating indexes for proof_reviews...');
        await client.query(`CREATE INDEX IF NOT EXISTS idx_proof_reviews_proof_id ON proof_reviews(proof_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_proof_reviews_reviewer_id ON proof_reviews(reviewer_id);`);

        console.log('✅ proof_reviews table created successfully!');

    } catch (error) {
        console.error('❌ Error creating proof_reviews table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createProofReviewsTable();
