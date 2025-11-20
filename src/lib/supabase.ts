import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://onmpewnqhmjbqutvwykd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubXBld25xaG1qYnF1dHZ3eWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDAxMTgsImV4cCI6MjA3OTIxNjExOH0.paoi7sux8_PjtYoSw6Zxi6fsc3FI_Ta3e5SeYcuw6lk'; // You'll need to provide this

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
