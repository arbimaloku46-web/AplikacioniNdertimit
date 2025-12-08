
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables, handling cases where import.meta.env is undefined
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    return (import.meta.env && import.meta.env[key]) || undefined;
  } catch (e) {
    return undefined;
  }
};

// Use environment variables if available, otherwise fallback to provided credentials
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://kfodljdnoaapfsocmywl.supabase.co';
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_HcIvNdcBwqfn4U58rFi5CA_xX0KRSnv';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key is missing.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
