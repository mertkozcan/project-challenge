# Implementation Plan - Adding Games & Bingo Tasks

## Goal Description
Add the following games to the platform and populate them with initial "Bingo Tasks" to enable the Bingo feature:
- Dark Souls 1, 2, 3
- Bloodborne
- Sekiro: Shadows Die Twice
- Lies of P
- Fallout 4
- Elder Scrolls V: Skyrim
- Baldur's Gate 3
- Cyberpunk 2077
- Resident Evil 2 Remake
- Resident Evil 3 Remake
- Resident Evil 4 Remake
- Resident Evil 7
- Resident Evil 8 (Village)
- Hollow Knight
- Minecraft
- Terraria
- The Binding of Isaac: Repentance
- Hades
- Celeste
- Cuphead
- The Witcher 3: Wild Hunt
- Monster Hunter: World
- Dead Cells
- Slay the Spire
- Stardew Valley

## Proposed Changes

### Database Seeding
#### [NEW] [seed_rpg_games.js](file:///e:/Projects/project-challenge/project-challenge/backend/scripts/seed_rpg_games.js)
- A script to:
    1.  Insert the games into the `games` table (if they don't exist).
    2.  Insert a set of ~25 generic/specific bingo tasks for each game into `bingo_tasks`.
    - *Note:* Since we don't have a scraper yet, I will use a predefined list of common challenges (e.g., "Defeat a boss without healing", "Find a secret area") tailored to each game's genre to get the user started immediately.

## Verification Plan

### Manual Verification
- Run the seed script: `node backend/scripts/seed_rpg_games.js`
- Check the database or UI to ensure games are listed.
- Create a Bingo Board for one of the new games to verify tasks appear.
