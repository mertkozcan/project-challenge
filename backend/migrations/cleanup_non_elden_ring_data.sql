-- Cleanup Script: Remove all non-Elden Ring game data
-- This script will delete all game-related data except for Elden Ring
-- Run this script carefully in your database

-- Start transaction for safety
BEGIN;

-- 1. Delete non-Elden Ring challenges and related data
-- First delete proofs related to non-Elden Ring challenges
DELETE FROM proofs 
WHERE challenge_id IN (
    SELECT id FROM challenges WHERE game_name != 'Elden Ring'
);



-- Delete the challenges themselves
DELETE FROM challenges WHERE game_name != 'Elden Ring';

-- 2. Delete non-Elden Ring builds and related data
-- Delete build ratings
DELETE FROM build_ratings 
WHERE build_id IN (
    SELECT id FROM builds WHERE game_name != 'Elden Ring'
);

-- Delete build comments
DELETE FROM build_comments 
WHERE build_id IN (
    SELECT id FROM builds WHERE game_name != 'Elden Ring'
);

-- Delete the builds themselves
DELETE FROM builds WHERE game_name != 'Elden Ring';

-- 3. Delete non-Elden Ring bingo boards and related data
-- Delete bingo cell completions for non-Elden Ring boards
DELETE FROM bingo_cell_completions 
WHERE cell_id IN (
    SELECT id FROM bingo_cells 
    WHERE board_id IN (
        SELECT id FROM bingo_boards WHERE game_name != 'Elden Ring'
    )
);

-- Delete bingo cells for non-Elden Ring boards
DELETE FROM bingo_cells 
WHERE board_id IN (
    SELECT id FROM bingo_boards WHERE game_name != 'Elden Ring'
);

-- Delete bingo room participants for non-Elden Ring rooms
DELETE FROM bingo_room_participants 
WHERE room_id IN (
    SELECT id FROM bingo_rooms 
    WHERE board_id IN (
        SELECT id FROM bingo_boards WHERE game_name != 'Elden Ring'
    )
);

-- Delete bingo invitations for non-Elden Ring rooms
DELETE FROM bingo_invitations 
WHERE room_id IN (
    SELECT id FROM bingo_rooms 
    WHERE board_id IN (
        SELECT id FROM bingo_boards WHERE game_name != 'Elden Ring'
    )
);

-- Delete bingo rooms for non-Elden Ring boards
DELETE FROM bingo_rooms 
WHERE board_id IN (
    SELECT id FROM bingo_boards WHERE game_name != 'Elden Ring'
);

-- Delete the bingo boards themselves
DELETE FROM bingo_boards WHERE game_name != 'Elden Ring';

-- 4. Delete non-Elden Ring run sessions
DELETE FROM run_sessions WHERE game_name != 'Elden Ring';

-- 5. Delete non-Elden Ring games from games table
DELETE FROM games WHERE name != 'Elden Ring';

-- Commit the transaction
COMMIT;

-- Verify the cleanup
SELECT 'Remaining Challenges' as table_name, COUNT(*) as count FROM challenges WHERE game_name = 'Elden Ring'
UNION ALL
SELECT 'Remaining Builds', COUNT(*) FROM builds WHERE game_name = 'Elden Ring'
UNION ALL
SELECT 'Remaining Bingo Boards', COUNT(*) FROM bingo_boards WHERE game_name = 'Elden Ring'
UNION ALL
SELECT 'Remaining Run Sessions', COUNT(*) FROM run_sessions WHERE game_name = 'Elden Ring'
UNION ALL
SELECT 'Remaining Games', COUNT(*) FROM games WHERE name = 'Elden Ring';
