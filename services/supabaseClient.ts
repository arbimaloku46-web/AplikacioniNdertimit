
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  // Check import.meta.env (Vite)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}

  // Check process.env (Node/System/Webpack)
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {}

  return '';
};

// You can overwrite these with VITE_SUPABASE_URL in .env, or just rely on these defaults
const defaultUrl = 'https://kfodljdnoaapfsocmywl.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmb2RsamRub2FhcGZzb2NteXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjE1MjMsImV4cCI6MjA4MDc5NzUyM30.9iP3HXdTil43MyVIkjYhMc1vgLJ9mLM9xxOUMM3iX4E';

export const supabaseUrl = getEnv('VITE_SUPABASE_URL') || defaultUrl;
export const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || defaultKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase URL or Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or environment variables.');
}

// If keys are missing, use placeholders to prevent the app from crashing immediately with "supabaseUrl is required".
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseKey || 'placeholder';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
