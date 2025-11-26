const pool = require('../config/db');

const games = [
    {
        name: 'Dark Souls',
        description: 'Action role-playing game developed by FromSoftware.',
        tasks: [
            'Defeat Asylum Demon', 'Ring the First Bell of Awakening', 'Defeat Capra Demon', 'Acquire the Lordvessel', 'Defeat Ornstein and Smough',
            'Join the Darkwraith Covenant', 'Defeat Sif, the Great Grey Wolf', 'Defeat the Four Kings', 'Defeat Gravelord Nito', 'Defeat Seath the Scaleless',
            'Defeat Bed of Chaos', 'Kindle a bonfire to 20 Estus', 'Upgrade a weapon to +15', 'Defeat Gwyn, Lord of Cinder', 'Cut off a tail',
            'Parry a Black Knight', 'Obtain the Drake Sword', 'Kill a mimic', 'Enter the Painted World', 'Defeat Crossbreed Priscilla',
            'Save Solaire', 'Obtain the Rite of Kindling', 'Defeat Pinwheel', 'Kill the Hydra', 'Obtain the Grass Crest Shield'
        ]
    },
    {
        name: 'Dark Souls II',
        description: 'The second installment in the Dark Souls trilogy.',
        tasks: [
            'Defeat the Last Giant', 'Defeat the Pursuer', 'Join the Company of Champions', 'Defeat the Ruin Sentinels', 'Light all primal bonfires',
            'Defeat the Looking Glass Knight', 'Acquire the King\'s Ring', 'Enter the Memory of Jeigh', 'Defeat Nashandra', 'Defeat the Fume Knight',
            'Defeat Sir Alonne', 'Defeat the Burnt Ivory King', 'Find the Emerald Herald', 'Upgrade a weapon to +10', 'Join the Heirs of the Sun',
            'Defeat the Old Iron King', 'Defeat the Rotten', 'Defeat the Duke\'s Dear Freja', 'Defeat the Lost Sinner', 'Obtain the Estus Flask Shard',
            'Burn a Human Effigy', 'Defeat the Smelter Demon', 'Defeat Darklurker', 'Obtain the Ring of Binding', 'Talk to Lucatiel in all locations'
        ]
    },
    {
        name: 'Dark Souls III',
        description: 'The final chapter of the Dark Souls series.',
        tasks: [
            'Defeat Iudex Gundyr', 'Defeat Vordt of the Boreal Valley', 'Defeat the Abyss Watchers', 'Defeat High Lord Wolnir', 'Defeat Pontiff Sulyvahn',
            'Defeat Aldrich, Devourer of Gods', 'Defeat Yhorm the Giant', 'Defeat the Dancer of the Boreal Valley', 'Defeat Dragonslayer Armour', 'Defeat Lothric, Younger Prince',
            'Defeat the Soul of Cinder', 'Defeat the Nameless King', 'Defeat Sister Friede', 'Defeat Darkeater Midir', 'Defeat Slave Knight Gael',
            'Join the Mound-Makers', 'Obtain the Coiled Sword Fragment', 'Upgrade a weapon to +10', 'Transpose a Boss Soul', 'Find the Fire Keeper Eyes',
            'Defeat Champion Gundyr', 'Enter Archdragon Peak', 'Defeat Oceiros, the Consumed King', 'Obtain the Red Eye Orb', 'Reach level 80'
        ]
    },
    {
        name: 'Bloodborne',
        description: 'Action RPG by FromSoftware set in the city of Yharnam.',
        tasks: [
            'Defeat Cleric Beast', 'Defeat Father Gascoigne', 'Defeat Blood-Starved Beast', 'Defeat Vicar Amelia', 'Defeat the Witch of Hemwick',
            'Defeat Shadow of Yharnam', 'Defeat Rom, the Vacuous Spider', 'Defeat The One Reborn', 'Defeat Micolash, Host of the Nightmare', 'Defeat Mergo\'s Wet Nurse',
            'Defeat Gehrman, the First Hunter', 'Defeat Moon Presence', 'Defeat Ludwig, the Holy Blade', 'Defeat Lady Maria', 'Defeat Orphan of Kos',
            'Acquire the Old Hunter Badge', 'Obtain the Ludwig\'s Holy Blade', 'Visceral Attack an enemy', 'Find the Abandoned Old Workshop', 'Join the Vilebloods',
            'Defeat Amygdala', 'Defeat Celestial Emissary', 'Defeat Ebrietas, Daughter of the Cosmos', 'Upgrade a weapon to +10', 'Complete a Chalice Dungeon'
        ]
    },
    {
        name: 'Sekiro: Shadows Die Twice',
        description: 'Action-adventure game focused on stealth and combat.',
        tasks: [
            'Defeat Gyoubu Oniwa', 'Defeat Lady Butterfly', 'Defeat Genichiro Ashina', 'Defeat Guardian Ape', 'Defeat Folding Screen Monkeys',
            'Defeat Corrupted Monk', 'Defeat Great Shinobi Owl', 'Defeat True Corrupted Monk', 'Defeat Divine Dragon', 'Defeat Demon of Hatred',
            'Defeat Isshin, the Sword Saint', 'Perform a Mikiri Counter', 'Acquire the Mortal Blade', 'Upgrade the Prosthetic Tool', 'Unlock a new Skill Tree',
            'Defeat a Headless', 'Defeat a Shichimen Warrior', 'Obtain the Dancing Dragon Mask', 'Cure Dragonrot', ' eavesdrop on a conversation',
            'Defeat Emma, the Gentle Blade', 'Defeat Isshin Ashina', 'Defeat Owl (Father)', 'Max out Vitality', 'Max out Attack Power'
        ]
    },
    {
        name: 'Lies of P',
        description: 'Soulslike game inspired by the story of Pinocchio.',
        tasks: [
            'Defeat Parade Master', 'Defeat Scrapped Watchman', 'Defeat King\'s Flame, Fuoco', 'Defeat Fallen Archbishop Andreus', 'Defeat Eldest of the Black Rabbit Brotherhood',
            'Defeat King of Puppets', 'Defeat Champion Victor', 'Defeat Green Monster of the Swamp', 'Defeat Laxasia the Complete', 'Defeat Simon Manus, Awakened God',
            'Defeat Nameless Puppet', 'Lie to an NPC', 'Tell the truth to an NPC', 'Upgrade a weapon to +10', 'Assemble a custom weapon',
            'Find a Trinity Key', 'Open a Trinity Room', 'Obtain the Golden Lie', 'Listen to a Record', 'Pet the cat',
            'Defeat the Mad Donkey', 'Defeat the Survivor', 'Defeat the White Lady', 'Acquire a Legion Arm', 'Reset P-Organ'
        ]
    },
    {
        name: 'Fallout 4',
        description: 'Post-apocalyptic action role-playing game.',
        tasks: [
            'Leave Vault 111', 'Meet Dogmeat', 'Join the Minutemen', 'Join the Brotherhood of Steel', 'Join the Railroad',
            'Join the Institute', 'Kill a Deathclaw', 'Discover Diamond City', 'Find a Bobblehead', 'Read a Magazine',
            'Modify a weapon', 'Build a settlement object', 'Hack a terminal', 'Pick a lock', 'Wear Power Armor',
            'Kill a Super Mutant Behemoth', 'Visit the Glowing Sea', 'Recruit a companion', 'Reach level 20', 'Complete "The Nuclear Option"',
            'Find a Nuka-Cola Quantum', 'Kill a Mirelurk Queen', 'Craft a chems', 'Cook food', 'Sleep in a bed'
        ]
    },
    {
        name: 'The Elder Scrolls V: Skyrim',
        description: 'Open world action role-playing video game.',
        tasks: [
            'Escape Helgen', 'Reach Whiterun', 'Kill the first Dragon', 'Learn a Shout', 'Join the Companions',
            'Join the College of Winterhold', 'Join the Thieves Guild', 'Join the Dark Brotherhood', 'Become Thane of Whiterun', 'Buy a house',
            'Get married', 'Adopt a child', 'Craft an Iron Dagger', 'Enchant an item', 'Brew a potion',
            'Discover 50 locations', 'Reach level 20', 'Kill a Giant', 'Kill a Mammoth', 'Read a Skill Book',
            'Find a Stone of Barenziah', 'Become a Werewolf', 'Become a Vampire', 'Visit High Hrothgar', 'Defeat Alduin'
        ]
    },
    {
        name: 'Baldur\'s Gate 3',
        description: 'Role-playing video game set in the Dungeons & Dragons universe.',
        tasks: [
            'Escape the Nautiloid', 'Recruit Shadowheart', 'Recruit Astarion', 'Recruit Gale', 'Recruit Lae\'zel',
            'Recruit Wyll', 'Recruit Karlach', 'Save the Tieflings', 'Destroy the Goblin Camp', 'Reach the Underdark',
            'Reach the Mountain Pass', 'Reach Moonrise Towers', 'Defeat Ketheric Thorm', 'Reach Baldur\'s Gate', 'Defeat Orin',
            'Defeat Gortash', 'Romance a companion', 'Pet Scratch', 'Speak with Dead', 'Use a Scroll of Revivify',
            'Pass a DC 20 check', 'Disarm a trap', 'Pickpocket an NPC', 'Shove an enemy off a ledge', 'Complete the game'
        ]
    },
    {
        name: 'Cyberpunk 2077',
        description: 'Action role-playing video game set in Night City.',
        tasks: [
            'Complete the Prologue', 'Meet Johnny Silverhand', 'Complete "The Heist"', 'Romance Judy', 'Romance Panam',
            'Romance River', 'Romance Kerry', 'Buy a vehicle', 'Install a Cyberware', 'Hack a protocol',
            'Defeat a Cyberpsycho', 'Reach max Street Cred', 'Complete all gigs in Watson', 'Find a Tarot Card', 'Visit the Afterlife',
            'Meet Hanako at Embers', 'Complete the game (The Star ending)', 'Complete the game (The Sun ending)', 'Complete the game (The Devil ending)', 'Complete the game (Temperance ending)',
            'Craft a Legendary item', 'Upgrade a weapon', 'Use a Sandevistan', 'Drive a motorcycle', 'Pet the cat (Nibbles)'
        ]
    },
    {
        name: 'Resident Evil 2 Remake',
        description: 'Survival horror game, remake of the 1998 classic.',
        tasks: [
            'Reach the Police Station', 'Solve the Lion Statue puzzle', 'Solve the Unicorn Statue puzzle', 'Solve the Maiden Statue puzzle', 'Open the Secret Passage',
            'Defeat G (Stage 1)', 'Play as Sherry/Ada', 'Escape the Parking Garage', 'Reach the Sewers', 'Solve the Chess Plug puzzle',
            'Defeat G (Stage 2)', 'Reach the NEST', 'Obtain the G-Virus/Sample', 'Defeat G (Stage 3)', 'Defeat Super Tyrant/G (Stage 4)',
            'Complete Leon A', 'Complete Claire A', 'Open a Dial Safe', 'Open a Portable Safe', 'Kill a Licker',
            'Kill a Zombie Dog', 'Use a Blue Herb', 'Combine Gunpowder', 'Find a Mr. Raccoon', 'Complete the game in under 4 hours'
        ]
    },
    {
        name: 'Resident Evil 3 Remake',
        description: 'Survival horror game, remake of the 1999 classic.',
        tasks: [
            'Escape the Apartment', 'Put out the fire in the alley', 'Restore power to the Subway', 'Defeat Nemesis (Flamethrower)', 'Reach the Police Station (Carlos)',
            'Defeat Nemesis (Clock Tower Plaza)', 'Reach the Hospital', 'Defend Jill (Carlos)', 'Reach the NEST 2', 'Synthesize the Vaccine',
            'Defeat Nemesis (Stage 2)', 'Defeat Nemesis (Stage 3)', 'Escape Raccoon City', 'Dodge an attack perfectly', 'Open a simple lock',
            'Find a Charlie Doll', 'Upgrade a weapon', 'Use a Grenade', 'Kill a Hunter Gamma', 'Kill a Hunter Beta',
            'Complete the game in under 2 hours', 'Don\'t use the Item Box', 'Don\'t use First Aid Sprays', 'Get the Magnum', 'Read all files'
        ]
    },
    {
        name: 'Resident Evil 4 Remake',
        description: 'Survival horror game, remake of the 2005 classic.',
        tasks: [
            'Survive the Village attack', 'Defeat Del Lago', 'Defeat El Gigante', 'Save Ashley', 'Defeat Bitores Mendez',
            'Reach the Castle', 'Defeat the Garrador', 'Defeat Verdugo', 'Defeat Ramon Salazar', 'Reach the Island',
            'Defeat Krauser', 'Defeat Saddler', 'Escape the Island', 'Parry an attack', 'Kill a Regenerador',
            'Upgrade a weapon fully', 'Find a Blue Medallion', 'Shoot a Blue Medallion', 'Kill a Merchant (Don\'t do it!)', 'Buy a Rocket Launcher',
            'Eat a Viper', 'Combine treasures', 'Complete a Merchant Request', 'Save the dog (Hey, it\'s that dog!)', 'Get the Chicago Sweeper'
        ]
    },
    {
        name: 'Resident Evil 7: Biohazard',
        description: 'Survival horror game returning to the series\' roots.',
        tasks: [
            'Defeat Mia (Guest House)', 'Escape the Main House', 'Defeat Jack Baker (Garage)', 'Defeat Jack Baker (Chainsaw)', 'Obtain the Crow Key',
            'Obtain the Snake Key', 'Defeat Marguerite Baker', 'Obtain the D-Series Arm', 'Solve the Happy Birthday puzzle', 'Defeat Jack Baker (Mutated)',
            'Choose Mia or Zoe', 'Play as Mia on the Ship', 'Repair the Elevator', 'Reach the Salt Mines', 'Defeat Eveline',
            'Find an Antique Coin', 'Destroy a Mr. Everywhere', 'Use a Chem Fluid', 'Craft a Psychostimulant', 'Block an attack',
            'Complete the game in under 4 hours', 'Open a Shadow Puzzle', 'Find the Shotgun', 'Find the Grenade Launcher', 'Escape the Bedroom (DLC)'
        ]
    },
    {
        name: 'Resident Evil Village',
        description: 'Survival horror game, sequel to Resident Evil 7.',
        tasks: [
            'Survive the Lycan attack', 'Enter Castle Dimitrescu', 'Defeat Lady Dimitrescu', 'Escape the Castle', 'Enter House Beneviento',
            'Defeat Donna Beneviento', 'Enter the Reservoir', 'Defeat Moreau', 'Enter the Stronghold', 'Enter the Factory',
            'Defeat Heisenberg', 'Play as Chris Redfield', 'Defeat Mother Miranda', 'Upgrade a weapon', 'Cook a meal at the Duke',
            'Find a Goat of Warding', 'Sell a Treasure', 'Kill a Lycan', 'Kill a Moroaica', 'Kill a Soldat',
            'Complete the Labyrinth Puzzle', 'Find the Wolfsbane Magnum', 'Unlock the "Village of Shadows" difficulty', 'Complete the game in under 3 hours', 'Don\'t spend any Lei'
        ]
    },
    {
        name: 'Hollow Knight',
        description: 'Metroidvania action-adventure game.',
        tasks: [
            'Defeat False Knight', 'Defeat Hornet (Greenpath)', 'Obtain Mothwing Cloak', 'Obtain Mantis Claw', 'Defeat Mantis Lords',
            'Obtain Crystal Heart', 'Obtain Monarch Wings', 'Defeat Soul Master', 'Defeat Dung Defender', 'Defeat Broken Vessel',
            'Obtain Isma\'s Tear', 'Defeat Watcher Knights', 'Defeat The Hollow Knight', 'Defeat Radiance', 'Rescue a Grub',
            'Open a Stag Station', 'Buy a Map', 'Upgrade the Nail', 'Equip a Charm', 'Find a Pale Ore',
            'Defeat Nosk', 'Defeat Traitor Lord', 'Complete the Colosseum of Fools (Trial 1)', 'Enter the White Palace', 'Acquire the Void Heart'
        ]
    },
    {
        name: 'Minecraft',
        description: 'Sandbox video game developed by Mojang.',
        tasks: [
            'Punch a tree', 'Craft a Crafting Table', 'Mine Iron Ore', 'Smelt Iron Ingot', 'Craft a Diamond Pickaxe',
            'Build a Nether Portal', 'Enter the Nether', 'Find a Nether Fortress', 'Kill a Blaze', 'Obtain a Blaze Rod',
            'Trade with a Villager', 'Find a Stronghold', 'Enter the End', 'Kill the Ender Dragon', 'Obtain the Dragon Egg',
            'Find an Elytra', 'Craft a Beacon', 'Tame a Wolf', 'Tame a Cat', 'Build a house',
            'Farm Wheat', 'Breed Cows', 'Catch a Fish', 'Enchant an item', 'Brew a Potion'
        ]
    },
    {
        name: 'Terraria',
        description: 'Action-adventure sandbox game.',
        tasks: [
            'Build a house for a generic NPC', 'Defeat the Eye of Cthulhu', 'Defeat the Eater of Worlds/Brain of Cthulhu', 'Defeat Skeletron', 'Enter the Dungeon',
            'Reach the Underworld', 'Defeat the Wall of Flesh', 'Enter Hardmode', 'Smash a Demon/Crimson Altar', 'Defeat The Destroyer',
            'Defeat The Twins', 'Defeat Skeletron Prime', 'Defeat Plantera', 'Defeat Golem', 'Defeat Duke Fishron',
            'Defeat the Lunatic Cultist', 'Defeat the Moon Lord', 'Craft a Terra Blade', 'Obtain a pair of Wings', 'Find a Sky Island',
            'Mine Hellstone', 'Craft Hallowed Armor', 'Find the Temple', 'Survive a Blood Moon', 'Survive a Solar Eclipse'
        ]
    },
    {
        name: 'The Binding of Isaac: Repentance',
        description: 'Indie roguelike video game.',
        tasks: [
            'Defeat Mom', 'Defeat Mom\'s Heart', 'Defeat Isaac', 'Defeat Satan', 'Defeat ??? (Blue Baby)',
            'Defeat The Lamb', 'Defeat Mega Satan', 'Defeat Hush', 'Defeat Delirium', 'Defeat Mother',
            'Defeat The Beast', 'Unlock a new character', 'Complete a Challenge', 'Find a Secret Room', 'Find a Super Secret Room',
            'Take a Devil Deal', 'Take an Angel Deal', 'Transform into Guppy', 'Get a Planetarium item', 'Break the game',
            'Donate to the Donation Machine', 'Blow up a Tinted Rock', 'Use a Pill', 'Use a Tarot Card', 'Die to a Spider'
        ]
    },
    {
        name: 'Hades',
        description: 'Roguelike action dungeon crawler.',
        tasks: [
            'Defeat Megaera', 'Defeat the Bone Hydra', 'Defeat Theseus and Asterius', 'Defeat Hades', 'Escape the Underworld',
            'Unlock a Weapon Aspect', 'Max out a Weapon Aspect', 'Give Nectar to an NPC', 'Give Ambrosia to an NPC', 'Pet Cerberus',
            'Fish in the Underworld', 'Complete a run with the Sword', 'Complete a run with the Spear', 'Complete a run with the Shield', 'Complete a run with the Bow',
            'Complete a run with the Fists', 'Complete a run with the Rail', 'Buy a decoration from the House Contractor', 'Unlock a Companion', 'Reach max relationship with a God',
            'Complete a run on high Heat', 'Find Sisyphus', 'Find Eurydice', 'Find Patroclus', 'Clear a Chaos Gate'
        ]
    },
    {
        name: 'Celeste',
        description: 'Platforming video game.',
        tasks: [
            'Complete Chapter 1', 'Complete Chapter 2', 'Complete Chapter 3', 'Complete Chapter 4', 'Complete Chapter 5',
            'Complete Chapter 6', 'Complete Chapter 7', 'Reach the Summit', 'Complete Chapter 8', 'Collect a Strawberry',
            'Collect 5 Strawberries', 'Collect 10 Strawberries', 'Find a Cassette Tape', 'Unlock a B-Side', 'Complete a B-Side',
            'Find a Crystal Heart', 'Die 100 times', 'Die 500 times', 'Talk to Theo', 'Talk to Granny',
            'Bounce on a cloud', 'Use a feather', 'Dash through a dream block', 'Complete a screen without dashing', 'Find the Pico-8 console'
        ]
    },
    {
        name: 'Cuphead',
        description: 'Run and gun action game.',
        tasks: [
            'Defeat The Root Pack', 'Defeat Goopy Le Grande', 'Defeat Ribby and Croaks', 'Defeat Hilda Berg', 'Defeat Cagney Carnation',
            'Defeat Baroness Von Bon Bon', 'Defeat Beppi The Clown', 'Defeat Djimmi The Great', 'Defeat Grim Matchstick', 'Defeat Wally Warbles',
            'Defeat Rumor Honeybottoms', 'Defeat Captain Brineybeard', 'Defeat Cala Maria', 'Defeat Dr. Kahl\'s Robot', 'Defeat Werner Werman',
            'Defeat Phantom Express', 'Defeat King Dice', 'Defeat The Devil', 'Parry a pink object', 'Use a Super Art',
            'Buy a new weapon', 'Buy a new charm', 'Get an A rank on a boss', 'Complete a Run & Gun level', 'Find a coin'
        ]
    },
    {
        name: 'The Witcher 3: Wild Hunt',
        description: 'Action role-playing game.',
        tasks: [
            'Kill the Griffin in White Orchard', 'Meet Yennefer', 'Meet Triss Merigold', 'Find Ciri', 'Defeat Eredin',
            'Complete the Bloody Baron questline', 'Play a game of Gwent', 'Win a game of Gwent', 'Collect a Gwent card', 'Complete a Witcher Contract',
            'Kill a Monster Nest', 'Liberate an Abandoned Site', 'Find a Place of Power', 'Craft a Witcher Potion', 'Craft a Witcher Oil',
            'Craft a Witcher Bomb', 'Upgrade a Witcher Gear set', 'Participate in a Horse Race', 'Participate in a Fist Fight', 'Romance someone',
            'Visit Skellige', 'Visit Novigrad', 'Visit Velen', 'Visit Kaer Morhen', 'Complete the game'
        ]
    },
    {
        name: 'Monster Hunter: World',
        description: 'Action role-playing game.',
        tasks: [
            'Hunt a Great Jagras', 'Hunt a Kulu-Ya-Ku', 'Hunt a Pukei-Pukei', 'Hunt a Barroth', 'Hunt a Jyuratodus',
            'Hunt a Tobi-Kadachi', 'Hunt an Anjanath', 'Hunt a Rathian', 'Hunt a Tzitzi-Ya-Ku', 'Hunt a Paolumu',
            'Hunt a Great Girros', 'Hunt a Radobaan', 'Hunt a Legiana', 'Hunt an Odogaron', 'Hunt a Rathalos',
            'Hunt a Diablos', 'Hunt a Kirin', 'Hunt Zorah Magdaros', 'Hunt Nergigante', 'Hunt Teostra',
            'Hunt Kushala Daora', 'Hunt Vaal Hazak', 'Hunt Xeno\'jiiva', 'Capture a monster', 'Cook a Well-Done Steak'
        ]
    },
    {
        name: 'Dead Cells',
        description: 'Roguelike-metroidvania hybrid.',
        tasks: [
            'Defeat The Concierge', 'Defeat Conjunctivius', 'Defeat The Time Keeper', 'Defeat The Hand of the King', 'Absorb a Boss Cell',
            'Reach the Promenade of the Condemned', 'Reach the Toxic Sewers', 'Reach the Ramparts', 'Reach the Black Bridge', 'Reach the Stilt Village',
            'Reach the Clock Tower', 'Reach the High Peak Castle', 'Unlock a Blueprint', 'Unlock a Weapon', 'Unlock a Skill',
            'Unlock a Mutation', 'Open a Cursed Chest', 'Survive a Curse', 'Find a Secret Area', 'Pet the Serenade',
            'Complete a run', 'Complete a run on 1 BC', 'Complete a run on 2 BC', 'Die to spikes', 'Perform a ground slam'
        ]
    },
    {
        name: 'Slay the Spire',
        description: 'Roguelike deck-building game.',
        tasks: [
            'Defeat The Guardian', 'Defeat Hexaghost', 'Defeat Slime Boss', 'Defeat The Champ', 'Defeat The Collector',
            'Defeat Bronze Automaton', 'Defeat Time Eater', 'Defeat Donu and Deca', 'Defeat Awakened One', 'Defeat the Corrupt Heart',
            'Win a run with Ironclad', 'Win a run with Silent', 'Win a run with Defect', 'Win a run with Watcher', 'Climb a floor',
            'Rest at a Campfire', 'Upgrade a card', 'Remove a card', 'Buy a Relic', 'Obtain a Boss Relic',
            'Defeat an Elite', 'Perfect an Elite', 'Perfect a Boss', 'Build a deck with 30+ cards', 'Build a deck with <10 cards'
        ]
    },
    {
        name: 'Stardew Valley',
        description: 'Simulation role-playing video game.',
        tasks: [
            'Plant a Parsnip', 'Harvest a Parsnip', 'Meet all villagers', 'Join the Adventurer\'s Guild', 'Reach level 5 in Farming',
            'Reach level 5 in Mining', 'Reach level 5 in Foraging', 'Reach level 5 in Fishing', 'Reach level 5 in Combat', 'Catch a Fish',
            'Donate to the Museum', 'Complete a Bundle', 'Repair the Community Center (one room)', 'Attend the Egg Festival', 'Win the Egg Hunt',
            'Dance at the Flower Dance', 'Put an item in the Luau soup', 'Buy a Chicken', 'Buy a Cow', 'Upgrade the House',
            'Upgrade a Tool', 'Reach floor 10 in the Mines', 'Find a Geode', 'Crack open a Geode', 'Gift a loved item'
        ]
    }
];

const seedGames = async () => {
    try {
        console.log('Starting seed process...');

        for (const game of games) {
            // 1. Check if game exists
            let gameId;
            const existingGame = await pool.query('SELECT id FROM games WHERE name = $1', [game.name]);

            if (existingGame.rows.length > 0) {
                gameId = existingGame.rows[0].id;
                console.log(`Game "${game.name}" already exists. ID: ${gameId}`);
            } else {
                // 2. Insert game
                const newGame = await pool.query(
                    'INSERT INTO games (name, description, icon_url) VALUES ($1, $2, $3) RETURNING id',
                    [game.name, game.description, ''] // Placeholder icon
                );
                gameId = newGame.rows[0].id;
                console.log(`Created game "${game.name}". ID: ${gameId}`);
            }

            // 3. Insert Bingo Tasks
            for (const task of game.tasks) {
                // Check if task exists to avoid duplicates
                const existingTask = await pool.query(
                    'SELECT id FROM bingo_tasks WHERE game_name = $1 AND task = $2',
                    [game.name, task]
                );

                if (existingTask.rows.length === 0) {
                    await pool.query(
                        'INSERT INTO bingo_tasks (game_name, task, difficulty, type) VALUES ($1, $2, $3, $4)',
                        [game.name, task, 'Normal', 'Standard']
                    );
                }
            }
            console.log(`Seeded tasks for "${game.name}"`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedGames();
