# Challenge Scoring System Proposal

## Goal
Create a fair, engaging, and competitive scoring system for gaming challenges that does not rely on automated In-Game Time (IGT) verification.

## Core Philosophy
Since we cannot automatically verify IGT, we must rely on **Difficulty**, **Speed of Submission** (Race), and **Community Validation**.

## Proposed Formula
**`Total Score = Base Score + Placement Bonus + Consistency Bonus`**

### 1. Base Score (Difficulty Tiers)
Every challenge has a fixed point value based on its difficulty. This ensures that completing a harder task is always worth more than an easy one, regardless of speed.

| Tier | Points | Examples |
| :--- | :--- | :--- |
| **Easy** | 100 | "Defeat the first boss", "Craft an iron sword" |
| **Medium** | 250 | "Finish the game", "Find all collectibles in Area 1" |
| **Hard** | 500 | "No Hit Boss Fight", "Speedrun under 2 hours" |
| **Insane** | 1000 | "SL1 Run", "No Hit Full Game" |

### 2. Placement Bonus (The "Race" Element)
To reward speed without needing precise IGT, we use a **"First-to-Verify"** system. The sooner you upload your proof after the challenge goes live, the more bonus points you get.

*   **1st Place (Gold):** +50% of Base Score
*   **2nd Place (Silver):** +25% of Base Score
*   **3rd Place (Bronze):** +10% of Base Score
*   **Top 10:** +5% of Base Score (Optional, for popular games)

*Example:*
*   **Hard Challenge (500 pts)**
*   **1st Place:** 500 + 250 = **750 pts**
*   **2nd Place:** 500 + 125 = **625 pts**

### 3. Consistency / "Grind" Bonus (RetroAchievements Style)
To reward dedicated players who might not be the fastest but are consistent.
*   **Streak Bonus:** +5% points for every consecutive day a challenge is completed (capped at +25%).
*   **Mastery Bonus:** Extra points for completing *all* challenges in a specific game or category.

### 4. Community "Style" Points (Optional)
Users can "Upvote" proofs.
*   **"MVP" Badge:** The proof with the most upvotes at the end of the challenge period gets a flat **+100 Point Bonus**.
*   *Why?* Encourages high-quality video submissions, entertaining commentary, or unique strategies.

## Fairness Mechanisms
1.  **Video Requirement:** All "Hard" and "Insane" challenges MUST have video proof. Screenshots are only okay for Easy/Medium.
2.  **Dispute System:** Users can flag suspicious proofs. If a proof is rejected, the user loses points and may be banned from the leaderboard.
3.  **Decay (Optional):** Old challenge scores might decay over time to keep the leaderboard fresh (e.g., "Season" based scoring).

## Why this works?
*   **Fair:** Everyone knows the point values upfront.
*   **Competitive:** The "Placement Bonus" simulates a race.
*   **Engaging:** "Style Points" and "Streaks" keep non-speedrunners interested.
*   **Robust:** Doesn't break if IGT is faked; relies on the *time of upload* which is server-verified.
