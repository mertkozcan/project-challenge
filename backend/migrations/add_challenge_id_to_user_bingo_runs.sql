-- Add challenge_id column to user_bingo_runs table
ALTER TABLE user_bingo_runs 
ADD COLUMN IF NOT EXISTS challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_bingo_runs_challenge ON user_bingo_runs(challenge_id);
