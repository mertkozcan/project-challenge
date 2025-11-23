const pool = require('../config/db');

/**
 * Migration: Create Build Ratings and Comments Tables
 * - build_ratings: Store user ratings for builds (1-5 stars)
 * - build_comments: Store user comments on builds
 */

const runMigration = async () => {
    try {
        console.log('🚀 Starting Build Ratings & Comments migration...');

        // 1. Create build_ratings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS build_ratings (
                id SERIAL PRIMARY KEY,
                build_id INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(build_id, user_id)
            );
        `);
        console.log('✅ Created build_ratings table');

        // 2. Create indexes for build_ratings
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_build_ratings_build 
            ON build_ratings(build_id);
            
            CREATE INDEX IF NOT EXISTS idx_build_ratings_user 
            ON build_ratings(user_id);
        `);
        console.log('✅ Created indexes for build_ratings');

        // 3. Create build_comments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS build_comments (
                id SERIAL PRIMARY KEY,
                build_id INTEGER NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                comment TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Created build_comments table');

        // 4. Create indexes for build_comments
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_build_comments_build 
            ON build_comments(build_id);
            
            CREATE INDEX IF NOT EXISTS idx_build_comments_user 
            ON build_comments(user_id);
            
            CREATE INDEX IF NOT EXISTS idx_build_comments_created 
            ON build_comments(created_at DESC);
        `);
        console.log('✅ Created indexes for build_comments');

        // 5. Add average_rating and rating_count columns to builds table
        await pool.query(`
            ALTER TABLE builds 
            ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
        `);
        console.log('✅ Added rating columns to builds table');

        console.log('🎉 Build Ratings & Comments migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
