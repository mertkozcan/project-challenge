const pool = require('../config/db');

/**
 * Migration: Rollback Daily Challenges (Use existing challenges table instead)
 * Drop daily_challenges and user_challenge_completions tables
 * Keep user_challenge_streaks and xp_transactions for the XP system
 */

const runMigration = async () => {
    try {
        console.log('🔄 Rolling back duplicate daily challenges tables...');

        // Drop tables in correct order (foreign keys first)
        await pool.query('DROP TABLE IF EXISTS user_challenge_completions CASCADE');
        console.log('✅ Dropped user_challenge_completions table');

        await pool.query('DROP TABLE IF EXISTS daily_challenges CASCADE');
        console.log('✅ Dropped daily_challenges table');

        console.log('🎉 Rollback completed! Will use existing challenges table instead.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Rollback failed:', error);
        process.exit(1);
    }
};

runMigration();
