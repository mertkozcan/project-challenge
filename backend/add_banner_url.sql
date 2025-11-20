-- Add banner_url column to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Update existing games with banner URLs
UPDATE games SET banner_url = 'https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg' WHERE name = 'Elden Ring';
UPDATE games SET banner_url = 'https://cdn.akamai.steamstatic.com/steam/apps/377160/library_hero.jpg' WHERE name = 'Fallout 4';
UPDATE games SET banner_url = 'https://cdn.akamai.steamstatic.com/steam/apps/72850/library_hero.jpg' WHERE name = 'The Elder Scrolls V: Skyrim';
UPDATE games SET banner_url = 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_hero.jpg' WHERE name = 'Cyberpunk 2077';
UPDATE games SET banner_url = 'https://cdn.akamai.steamstatic.com/steam/apps/374320/library_hero.jpg' WHERE name = 'Dark Souls 3';
