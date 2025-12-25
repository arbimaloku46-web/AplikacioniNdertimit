
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

export const supabaseUrl = getEnv('VITE_SUPABASE_URL');
export const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase URL or Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or environment variables.');
}

// If keys are missing, use placeholders to prevent the app from crashing immediately with "supabaseUrl is required".
// This allows the UI to render (likely in a logged-out state) and display errors when actions are attempted.
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseKey || 'placeholder';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
