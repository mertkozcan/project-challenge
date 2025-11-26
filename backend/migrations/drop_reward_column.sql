-- Update reward_xp from reward string if reward_xp is null or 0, and reward contains numbers
UPDATE challenges 
SET reward_xp = (regexp_match(reward, '\d+'))[1]::INTEGER 
WHERE (reward_xp IS NULL OR reward_xp = 0) AND reward ~ '\d+';

-- Drop the reward column
ALTER TABLE challenges DROP COLUMN IF EXISTS reward;
