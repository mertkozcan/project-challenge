require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use environment variables if available, otherwise fallback to the known keys (TEMPORARY)
// Ideally, these should be in .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('[Config] Missing SUPABASE_URL or SUPABASE_KEY in .env');
    // process.exit(1); // Optional: Fail fast
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
