-- Multiplayer Bingo System - Database Migration
-- Run this script to add multiplayer functionality to existing bingo system

-- 1. Bingo Rooms Table
CREATE TABLE IF NOT EXISTS bingo_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id INTEGER REFERENCES bingo_boards(id) ON DELETE CASCADE,
  host_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'WAITING', -- WAITING, IN_PROGRESS, COMPLETED
  max_players INTEGER DEFAULT 4,
  winner_user_id UUID REFERENCES users(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Room Participants Table
CREATE TABLE IF NOT EXISTS bingo_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES bingo_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_ready BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, user_id)
);

-- 3. Cell Completions Table (per room)
CREATE TABLE IF NOT EXISTS bingo_cell_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES bingo_rooms(id) ON DELETE CASCADE,
  cell_id INTEGER REFERENCES bingo_cells(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, cell_id, user_id)
);

-- 4. Invitations Table
CREATE TABLE IF NOT EXISTS bingo_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES bingo_rooms(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bingo_rooms_status ON bingo_rooms(status);
CREATE INDEX IF NOT EXISTS idx_bingo_rooms_host ON bingo_rooms(host_user_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON bingo_room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user ON bingo_room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_cell_completions_room ON bingo_cell_completions(room_id);
CREATE INDEX IF NOT EXISTS idx_cell_completions_user ON bingo_cell_completions(room_id, user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_to_user ON bingo_invitations(to_user_id, status);

-- Add comment for documentation
COMMENT ON TABLE bingo_rooms IS 'Multiplayer bingo game rooms';
COMMENT ON TABLE bingo_room_participants IS 'Players in each bingo room';
COMMENT ON TABLE bingo_cell_completions IS 'Tracks which cells each player has completed in a room';
COMMENT ON TABLE bingo_invitations IS 'Room invitations sent between users';
