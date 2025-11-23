const pool = require('../config/db');

/**
 * Migration: Create XP Transactions Table
 * Track all XP awards for transparency and debugging
 */

const runMigration = async () => {
    try {
        console.log('🚀 Starting XP Transactions migration...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS xp_transactions (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                amount INTEGER NOT NULL,
                source VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Created xp_transactions table');

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_xp_transactions_user 
            ON xp_transactions(user_id);
            
            CREATE INDEX IF NOT EXISTS idx_xp_transactions_created 
            ON xp_transactions(created_at);
        `);
        console.log('✅ Created indexes for xp_transactions');

        console.log('🎉 XP Transactions migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
