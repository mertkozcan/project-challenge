require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateProofsTable() {
    const client = await pool.connect();

    try {
        console.log('Updating proofs table with verification columns...');

        // Add new columns
        await client.query(`
      ALTER TABLE proofs 
      ADD COLUMN IF NOT EXISTS run_code VARCHAR(10),
      ADD COLUMN IF NOT EXISTS status_screenshot_url TEXT,
      ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'PENDING',
      ADD COLUMN IF NOT EXISTS approval_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS rejection_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS ocr_result VARCHAR(20),
      ADD COLUMN IF NOT EXISTS ocr_extracted_text TEXT,
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
    `);

        console.log('Adding foreign key constraint...');

        // Add foreign key (if run_sessions table exists)
        await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'fk_run_code'
        ) THEN
          ALTER TABLE proofs 
          ADD CONSTRAINT fk_run_code 
          FOREIGN KEY (run_code) REFERENCES run_sessions(run_code) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

        console.log('Creating indexes...');

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_proofs_run_code ON proofs(run_code);
      CREATE INDEX IF NOT EXISTS idx_proofs_verification_status ON proofs(verification_status);
      CREATE INDEX IF NOT EXISTS idx_proofs_ocr_result ON proofs(ocr_result);
    `);

        console.log('✅ proofs table updated successfully!');

    } catch (error) {
        console.error('❌ Error updating proofs table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

updateProofsTable();
