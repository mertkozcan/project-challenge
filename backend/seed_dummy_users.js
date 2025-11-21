const pool = require('./config/db');
const { v4: uuidv4 } = require('uuid');

const dummyUsers = [
    { username: 'DragonSlayer', email: 'dragon@test.com', avatar_seed: 'Dragon' },
    { username: 'PixelMaster', email: 'pixel@test.com', avatar_seed: 'Pixel' },
    { username: 'SpeedRunner', email: 'speed@test.com', avatar_seed: 'Speed' },
    { username: 'LootGoblin', email: 'loot@test.com', avatar_seed: 'Loot' },
    { username: 'NoobSaibot', email: 'noob@test.com', avatar_seed: 'Noob' },
    { username: 'ProGamer99', email: 'pro@test.com', avatar_seed: 'Pro' },
    { username: 'GlitchHunter', email: 'glitch@test.com', avatar_seed: 'Glitch' },
    { username: 'RetroFan', email: 'retro@test.com', avatar_seed: 'Retro' },
    { username: 'QuestGiver', email: 'quest@test.com', avatar_seed: 'Quest' },
    { username: 'BossFight', email: 'boss@test.com', avatar_seed: 'Boss' },
];

const seedDummyUsers = async () => {
    try {
        console.log('Seeding dummy users...');

        // Re-create proofs table to ensure correct schema (UUID user_id)
        // WARNING: This deletes all existing proofs!
        await pool.query('DROP TABLE IF EXISTS proofs');
        await pool.query(`
            CREATE TABLE proofs (
                id UUID PRIMARY KEY,
                user_id UUID REFERENCES users(id),
                challenge_id INTEGER REFERENCES challenges(id),
                media_url TEXT,
                media_type TEXT,
                status TEXT,
                score INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Re-created proofs table.');

        // Get some challenge IDs
        const challengesResult = await pool.query('SELECT id FROM challenges LIMIT 10');
        const challengeIds = challengesResult.rows.map(r => r.id);

        if (challengeIds.length === 0) {
            console.log('No challenges found. Please seed challenges first.');
            return;
        }

        for (const user of dummyUsers) {
            const userId = uuidv4();
            const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar_seed}`;
            const points = Math.floor(Math.random() * 5000) + 100; // Random points

            // Insert User
            await pool.query(
                `INSERT INTO users (id, username, email, avatar_url, points, is_admin) 
                 VALUES ($1, $2, $3, $4, $5, false)
                 ON CONFLICT (username) DO NOTHING`,
                [userId, user.username, user.email, avatarUrl, points]
            );

            // Get the user ID (in case it already existed or was just inserted)
            const userResult = await pool.query('SELECT id FROM users WHERE username = $1', [user.username]);

            if (userResult.rows.length > 0) {
                const actualUserId = userResult.rows[0].id;

                // Add some proofs (completed challenges)
                const numProofs = Math.floor(Math.random() * 8) + 1;
                for (let i = 0; i < numProofs; i++) {
                    const challengeId = challengeIds[Math.floor(Math.random() * challengeIds.length)];
                    const proofId = uuidv4();

                    // Check if proof already exists
                    const existingProof = await pool.query(
                        'SELECT id FROM proofs WHERE user_id = $1 AND challenge_id = $2',
                        [actualUserId, challengeId]
                    );

                    if (existingProof.rows.length === 0) {
                        await pool.query(
                            `INSERT INTO proofs (id, user_id, challenge_id, media_url, media_type, status, created_at, score)
                             VALUES ($1, $2, $3, $4, 'image', 'APPROVED', NOW() - (random() * interval '30 days'), $5)`,
                            [proofId, actualUserId, challengeId, 'https://via.placeholder.com/150', Math.floor(Math.random() * 1000)]
                        );
                    }
                }
                console.log(`Seeded user: ${user.username} with ${points} points`);
            }
        }

        console.log('Dummy users seeded successfully!');
    } catch (error) {
        console.error('Error seeding dummy users:', error);
    } finally {
        // Close the pool
        await pool.end();
    }
};

seedDummyUsers();
