-- Drop challenge_id column from user_bingo_runs table
ALTER TABLE user_bingo_runs 
DROP COLUMN IF EXISTS challenge_id;
