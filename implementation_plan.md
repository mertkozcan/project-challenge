# Implementation Plan - Scoring & Voting System

## Goal Description
Implement the "Hybrid Scoring System" (Base + Placement + Consistency) and a Community Voting feature for proofs.

## Proposed Changes

### Database Schema
#### [NEW] [migration_scoring.sql](file:///e:/Projects/project-challenge/project-challenge/backend/migrations/migration_scoring.sql)
- **Alter `challenges` table:**
    - Add `difficulty` (ENUM: 'Easy', 'Medium', 'Hard', 'Insane').
    - Add `base_points` (INT).
- **Alter `proofs` table:**
    - Add `likes_count` (INT, default 0).
    - Add `placement` (INT, nullable) - to store if they were 1st, 2nd, etc.
- **Create `proof_votes` table:**
    - `id` (UUID)
    - `proof_id` (UUID, FK)
    - `user_id` (UUID, FK)
    - `vote_type` (ENUM: 'UPVOTE', 'DOWNVOTE') - currently only Upvote planned but good for future.
    - Unique constraint on `(proof_id, user_id)`.

### Backend Models & Controllers
#### [MODIFY] [challengeModel.js](file:///e:/Projects/project-challenge/project-challenge/backend/models/challengeModel.js)
- Update `createChallenge` to accept `difficulty`.
- Update `getChallengeById` to return `difficulty` and `base_points`.

#### [MODIFY] [proofModel.js](file:///e:/Projects/project-challenge/project-challenge/backend/models/proofModel.js)
- Update `updateProofStatus` to calculate score based on placement.
    - Logic: When status becomes 'APPROVED', count existing approved proofs for this challenge. If 0, then this is 1st place.
    - Calculate score: `base_points` + `placement_bonus`.
- Add `voteProof(proofId, userId)` function.

#### [MODIFY] [proofController.js](file:///e:/Projects/project-challenge/project-challenge/backend/controllers/proofController.js)
- Add `voteProof` endpoint handler.

### Frontend UI
#### [MODIFY] [ChallengeDetails.tsx](file:///e:/Projects/project-challenge/project-challenge/src/pages/challenges/ChallengeDetails.tsx)
- Add "Community Proofs" section.
- Display proofs in a grid/list.
- Show "Rank" badge (1st, 2nd, 3rd) on proofs.
- Add "Like" button with counter.

## Verification Plan

### Manual Verification
- **Scoring:**
    - Create a new Challenge (Hard).
    - User A submits proof -> Admin approves -> Check Score (Should be 750: 500 base + 250 bonus).
    - User B submits proof -> Admin approves -> Check Score (Should be 625: 500 base + 125 bonus).
- **Voting:**
    - User A likes User B's proof.
    - Check database `proof_votes` and `proofs.likes_count`.
    - User A tries to like again -> Should fail or toggle off.
