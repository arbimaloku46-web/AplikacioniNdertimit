
import { User } from '../types';
import { supabase } from './supabaseClient';

// Helper to map Supabase user to our App User type
const mapSupabaseUser = (sbUser: any): User => {
  if (!sbUser) throw new Error('No user data');
  
  const metadata = sbUser.user_metadata || {};
  const appMetadata = sbUser.app_metadata || {};
  
  return {
    uid: sbUser.id,
    email: sbUser.email || null,
    name: metadata.full_name || metadata.name || 'User',
    username: metadata.username || sbUser.email?.split('@')[0] || 'user',
    photoURL: metadata.avatar_url || metadata.picture || null,
    // Check both app_metadata (secure, set by SQL) and user_metadata (fallback)
    isAdmin: appMetadata.is_admin === true || metadata.is_admin === true,
    countryCode: metadata.country_code
  };
};

export const registerUser = async (data: any): Promise<{ user: User; session: any }> => {
  console.log("Attempting registration for:", data.identifier);
  
  const { data: result, error } = await supabase.auth.signUp({
    email: data.identifier.trim(),
    password: data.password.trim(),
    options: {
      // Removed emailRedirectTo to avoid 'Redirect URL not allowed' errors if localhost isn't whitelisted.
      // It will default to the Site URL configured in Supabase.
      data: {
        full_name: data.fullName ? data.fullName.trim() : '',
        username: data.username ? data.username.trim() : '',
        is_admin: false,
      },
    },
  });

  if (error) {
    console.error("Supabase SignUp Error:", error);
    throw error;
  }
  
  if (!result.user) throw new Error('Registration failed: No user returned');

  console.log("Registration successful", result);

  return {
    user: mapSupabaseUser(result.user),
    session: result.session
  };
};

export const loginUser = async (identifier: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier.trim(),
    password: password.trim(),
  });

  if (error) throw error;
  if (!data.user) throw new Error('Login failed');

  return mapSupabaseUser(data.user);
};

export const getRedirectUrl = () => {
    // 1. Explicit VITE_SITE_URL (Best for Production)
    if (import.meta.env.VITE_SITE_URL) {
        return import.meta.env.VITE_SITE_URL;
    }
    // 2. Window Origin (Fallback for Localhost)
    return window.location.origin;
};

export const loginWithGoogle = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: getRedirectUrl()
    }
  });

  if (error) throw error;
  // Browser will redirect automatically
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error signing out:', error);
};

export const getCurrentSession = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return mapSupabaseUser(session.user);
};
