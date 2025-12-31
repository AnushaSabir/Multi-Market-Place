import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// These should be in .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('YOUR_SUPABASE_URL')) {
    console.error('\n\x1b[31m%s\x1b[0m', '************************************************************');
    console.error('\x1b[31m%s\x1b[0m', '❌ CRITICAL ERROR: Missing Supabase Credentials');
    console.error('\x1b[31m%s\x1b[0m', '************************************************************');
    console.error('You need to configure your environment variables.');
    console.error('1. Open the file: backend/.env');
    console.error('2. Replace "YOUR_SUPABASE_URL" with your actual Supabase Project URL.');
    console.error('3. Replace "YOUR_SUPABASE_SERVICE_ROLE_KEY" with your actual Service Role Key.');
    console.error('\nGet these from: https://supabase.com/dashboard/project/_/settings/api');
    console.error('************************************************************\n');
    process.exit(1);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
