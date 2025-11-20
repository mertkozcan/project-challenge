const pool = require('./config/db');

async function addBannerColumn() {
    try {
        await pool.query(`
            ALTER TABLE games 
            ADD COLUMN IF NOT EXISTS banner_url TEXT;
        `);
        console.log('✅ banner_url column added to games table');

        // Update existing games with banner URLs
        await pool.query(`
            UPDATE games SET banner_url = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200' WHERE name = 'Elden Ring';
            UPDATE games SET banner_url = 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200' WHERE name = 'Fallout 4';
            UPDATE games SET banner_url = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200' WHERE name = 'Skyrim';
            UPDATE games SET banner_url = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200' WHERE name = 'Cyberpunk 2077';
            UPDATE games SET banner_url = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200' WHERE name = 'Dark Souls 3';
        `);
        console.log('✅ Banner URLs updated for existing games');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addBannerColumn();
