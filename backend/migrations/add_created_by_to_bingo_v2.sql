ALTER TABLE bingo_boards ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
