const pool = require('../config/db');

/**
 * Migration: Enhance existing challenges table with XP rewards
 * Add reward_xp column to challenges table
 * Add challenge_id to user_challenge_streaks for tracking
 */

const runMigration = async () => {
    try {
        console.log('🚀 Enhancing challenges table with XP system...');

        // Add reward_xp to challenges table
        await pool.query(`
            ALTER TABLE challenges 
            ADD COLUMN IF NOT EXISTS reward_xp INTEGER DEFAULT 100;
        `);
        console.log('✅ Added reward_xp column to challenges table');

        // Update existing challenges with default XP based on type
        await pool.query(`
            UPDATE challenges 
            SET reward_xp = CASE 
                WHEN type = 'daily' THEN 200
                WHEN type = 'weekly' THEN 500
                ELSE 100
            END
            WHERE reward_xp IS NULL OR reward_xp = 100;
        `);
        console.log('✅ Updated existing challenges with default XP rewards');

        console.log('🎉 Challenges table enhancement completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
