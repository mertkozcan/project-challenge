-- Add difficulty and base_points to challenges
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'Medium';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS base_points INTEGER DEFAULT 250;

-- Add likes_count and placement to proofs
ALTER TABLE proofs ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
ALTER TABLE proofs ADD COLUMN IF NOT EXISTS placement INTEGER;

-- Create proof_votes table
CREATE TABLE IF NOT EXISTS proof_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proof_id UUID REFERENCES proofs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) DEFAULT 'UPVOTE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(proof_id, user_id)
);
