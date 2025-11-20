const { createGame, getAllGames } = require('./models/gameModel');
const { createChallenge } = require('./models/challengeModel');
const { createBuild } = require('./models/buildModel');
const { createBoard, addCell } = require('./models/bingoModel');
const pool = require('./config/db');

const seedData = async () => {
    try {
        console.log('Starting seed...');

        // 1. Games
        console.log('Seeding Games...');
        const games = [
            { name: 'Elden Ring', description: 'An action RPG by FromSoftware.', iconUrl: 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg?t=1726158298' },
            { name: 'Fallout 4', description: 'Post-apocalyptic RPG by Bethesda.', iconUrl: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3ccd3cde-f8c0-480c-ab9d-4db767bda944/dc0qed1-b0a282de-11cc-4844-b601-241b94f6de9b.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzNjY2QzY2RlLWY4YzAtNDgwYy1hYjlkLTRkYjc2N2JkYTk0NFwvZGMwcWVkMS1iMGEyODJkZS0xMWNjLTQ4NDQtYjYwMS0yNDFiOTRmNmRlOWIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.0hqnm3A02kq-bPK5UCSumoHiKseVa-QJH-paxA2dn3Y' },
            { name: 'The Elder Scrolls V: Skyrim', description: 'Open world fantasy RPG.', iconUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHWS3TCWOCd-df-P4O48JC76fk9Byp8uje5w&s' },
            { name: 'Cyberpunk 2077', description: 'Open world action-adventure story.', iconUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQueQFtpY8c-MiiP0xR36ItyR_x_Ef-igWcdw&s' },
            { name: 'Dark Souls 3', description: 'Action RPG known for its difficulty.', iconUrl: 'https://cdn2.steamgriddb.com/hero_thumb/2181d94fba9a1d2de2b5f6fb75f8ab08.jpg' },
        ];

        const existingGames = await getAllGames();
        const existingGameNames = new Set(existingGames.map(g => g.name));

        for (const game of games) {
            if (!existingGameNames.has(game.name)) {
                await createGame(game.name, game.description, game.iconUrl);
                console.log(`Created game: ${game.name}`);
            } else {
                console.log(`Game already exists: ${game.name}`);
            }
        }

        // 2. Challenges (Official)
        console.log('Seeding Challenges...');
        const challenges = [
            { gameName: 'Elden Ring', challengeName: 'Godrick the Grafted', description: 'Kill Godrick the Grafted.', reward: '100 Points', type: 'permanent' },
            { gameName: 'Elden Ring', challengeName: 'Defeat Malenia without taking damage', description: 'Bu haftanın zorluğu: Malenia\'yı hiç hasar almadan yenin!', reward: 'Altın Kılıç', type: 'weekly' },
            { gameName: 'Fallout 4', challengeName: 'Survival Mode Run', description: 'Complete the main quest in Survival Mode.', reward: '500 Points', type: 'permanent' },
        ];

        for (const challenge of challenges) {
            const check = await pool.query('SELECT id FROM challenges WHERE challenge_name = $1', [challenge.challengeName]);
            if (check.rows.length === 0) {
                await pool.query(
                    'INSERT INTO challenges (game_name, challenge_name, description, reward, type, is_official) VALUES ($1, $2, $3, $4, $5, $6)',
                    [challenge.gameName, challenge.challengeName, challenge.description, challenge.reward, challenge.type, true]
                );
                console.log(`Created challenge: ${challenge.challengeName}`);
            } else {
                console.log(`Challenge already exists: ${challenge.challengeName}`);
            }
        }

        // 3. Builds (Official)
        console.log('Seeding Builds...');
        let userRes = await pool.query('SELECT id FROM users LIMIT 1');
        let userId;

        if (userRes.rows.length > 0) {
            userId = userRes.rows[0].id;
        } else {
            console.log('No users found. Creating admin user...');
            const newUser = await pool.query(
                "INSERT INTO users (username, email, password_hash, role) VALUES ('admin_seeder', 'admin@example.com', 'hash', 'admin') RETURNING id"
            );
            userId = newUser.rows[0].id;
        }
        console.log(`Using User ID for builds: ${userId}`);

        const builds = [
            { gameName: 'Fallout 4', buildName: 'Melee Build', description: 'Conquer the wasteland with pure strength and melee weapons!', itemsJson: '{}' },
            { gameName: 'The Elder Scrolls V: Skyrim', buildName: 'Mage Build', description: 'Become a master of destruction magic and defeat Alduin.', itemsJson: '{}' },
            { gameName: 'Cyberpunk 2077', buildName: 'Stealth Hacker', description: 'Complete missions using only stealth and quickhacks.', itemsJson: '{}' },
            { gameName: 'Dark Souls 3', buildName: 'Pyromancer Build', description: 'Use the power of fire to conquer Lordran.', itemsJson: '{}' },
        ];

        for (const build of builds) {
            const check = await pool.query('SELECT id FROM builds WHERE build_name = $1', [build.buildName]);
            if (check.rows.length === 0) {
                await pool.query(
                    'INSERT INTO builds (user_id, game_name, build_name, description, items_json, is_official) VALUES ($1, $2, $3, $4, $5, $6)',
                    [userId, build.gameName, build.buildName, build.description, build.itemsJson, true]
                );
                console.log(`Created build: ${build.buildName}`);
            } else {
                console.log(`Build already exists: ${build.buildName}`);
            }
        }

        // 4. Bingo Boards with meaningful tasks
        console.log('Seeding Bingo Boards...');

        const fallout4Tasks = [
            'Find a Power Armor', 'Kill a Deathclaw', 'Build a Settlement', 'Complete Railroad Quest', 'Find Dogmeat',
            'Craft a Weapon', 'Discover Diamond City', 'Kill 10 Raiders', 'Find a Bobblehead', 'Hack a Terminal',
            'Lockpick a Safe', 'Complete Brotherhood Quest', 'Find Vault 111', 'Craft Armor', 'Kill Super Mutant',
            'Discover Goodneighbor', 'Complete Minutemen Quest', 'Find Magazine', 'Cook a Meal', 'Build Water Purifier',
            'Kill Legendary Enemy', 'Discover Red Rocket', 'Complete Institute Quest', 'Tame a Creature', 'Find Fusion Core'
        ];

        const skyrimTasks = [
            'Slay a Dragon', 'Join Companions', 'Learn a Shout', 'Complete Thieves Guild', 'Find Daedric Artifact',
            'Reach Level 10', 'Join Dark Brotherhood', 'Discover Whiterun', 'Kill a Giant', 'Complete College Quest',
            'Find Dragon Priest Mask', 'Craft Daedric Armor', 'Marry an NPC', 'Become a Thane', 'Complete Civil War',
            'Discover Solitude', 'Kill 10 Draugr', 'Find Unusual Gem', 'Complete Dawnguard', 'Adopt a Child',
            'Discover Riften', 'Enchant an Item', 'Brew a Potion', 'Complete Main Quest', 'Reach Throat of World'
        ];

        const darkSouls3Tasks = [
            'Defeat Iudex Gundyr', 'Find Estus Shard', 'Defeat Vordt', 'Light a Bonfire',
            'Upgrade Weapon to +3', 'Defeat Curse-Rotted', 'Find Bone Shard', 'Kill Crystal Lizard',
            'Defeat Abyss Watchers', 'Join Covenant', 'Find Titanite Slab', 'Defeat Deacons',
            'Upgrade Estus Flask', 'Defeat Pontiff', 'Find Ember', 'Defeat Aldrich'
        ];

        const bingos = [
            { gameName: 'Fallout 4', title: 'Wasteland Survivor Bingo', description: 'Complete challenges across the Commonwealth in a 5x5 bingo grid.', size: 5, tasks: fallout4Tasks },
            { gameName: 'The Elder Scrolls V: Skyrim', title: 'Dragonborn Bingo', description: 'Slay dragons and complete quests in this ultimate bingo challenge.', size: 5, tasks: skyrimTasks },
            { gameName: 'Dark Souls 3', title: 'Firelink Bingo', description: 'Defeat bosses and complete achievements in a 4x4 grid.', size: 4, tasks: darkSouls3Tasks },
        ];

        for (const bingo of bingos) {
            const check = await pool.query('SELECT id FROM bingo_boards WHERE title = $1', [bingo.title]);
            if (check.rows.length === 0) {
                const board = await createBoard(bingo.gameName, bingo.title, bingo.description, bingo.size);
                let taskIndex = 0;
                for (let i = 0; i < bingo.size; i++) {
                    for (let j = 0; j < bingo.size; j++) {
                        await addCell(board.id, i, j, bingo.tasks[taskIndex]);
                        taskIndex++;
                    }
                }
                console.log(`Created bingo board: ${bingo.title}`);
            } else {
                console.log(`Bingo board already exists: ${bingo.title}`);
            }
        }

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        pool.end();
    }
};

seedData();
