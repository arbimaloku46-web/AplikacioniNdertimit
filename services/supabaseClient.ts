
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// 1. Get these from Supabase Dashboard > Project Settings > API
// 2. You can paste them directly here to test, OR use a .env file (recommended)
const HARDCODED_URL = 'https://kfodljdnoaapfsocmywl.supabase.co'; // e.g. 'https://xyz.supabase.co'
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmb2RsamRub2FhcGZzb2NteXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjE1MjMsImV4cCI6MjA4MDc5NzUyM30.9iP3HXdTil43MyVIkjYhMc1vgLJ9mLM9xxOUMM3iX4E'; // e.g. 'eyJJh...'

const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}
  return '';
};

// Priority: Hardcoded -> Environment Variable -> Empty
// IMPORTANT: We .trim() the values to remove accidental newlines/spaces from copy-pasting
export const supabaseUrl = (HARDCODED_URL || getEnv('VITE_SUPABASE_URL')).trim();
export const supabaseKey = (HARDCODED_KEY || getEnv('VITE_SUPABASE_ANON_KEY')).trim();

// Debugging
if (!supabaseUrl || !supabaseKey) {
  console.error(`
    CRITICAL ERROR: Supabase Credentials Missing.
    
    To fix this "Failed to fetch" error:
    1. Go to services/supabaseClient.ts
    2. Paste your URL and Anon Key into HARDCODED_URL and HARDCODED_KEY
    3. OR create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
    4. Restart your terminal/server
  `);
}

// Fallback to avoid immediate crash, but Auth calls will fail with "Failed to fetch" if these are used.
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseKey || 'placeholder';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
