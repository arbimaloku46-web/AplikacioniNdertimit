
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

export const getRedirectUrl = () => {
    // Dynamically determine the redirect URL based on the current browser location.
    // This works automatically for Localhost, Vercel Preview, and Vercel Production.
    let url = 'http://localhost:5173';
    
    if (typeof window !== 'undefined') {
        url = window.location.origin;
    } else if (import.meta.env.VITE_SITE_URL) {
        url = import.meta.env.VITE_SITE_URL;
    }
    
    return url;
};

export const registerUser = async (data: any): Promise<{ user: User; session: any }> => {
  const redirectUrl = getRedirectUrl();
  console.log("Attempting registration for:", data.identifier);
  console.log("Using Redirect URL for Email Confirmation:", redirectUrl);
  
  const { data: result, error } = await supabase.auth.signUp({
    email: data.identifier.trim(),
    password: data.password.trim(),
    options: {
      // Redirect back to the app after clicking the email confirmation link
      emailRedirectTo: redirectUrl,
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
  
  // result.user will be null if auto-confirm is off and email verification is required, 
  // BUT in recent Supabase versions it returns the user object with `identities` array.
  if (!result.user) throw new Error('Registration failed: No user returned');

  console.log("Registration API Call Successful. Session exists?", !!result.session);

  return {
    user: mapSupabaseUser(result.user),
    session: result.session // Session is null if email confirmation is required
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

export const loginWithGoogle = async (): Promise<void> => {
  const redirectUrl = getRedirectUrl();
  console.log("Initiating Google Auth.");
  console.log("IMPORTANT: Ensure this URL is added to Supabase > Authentication > URL Configuration > Redirect URLs:");
  console.log(redirectUrl);
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: redirectUrl,
        queryParams: {
            access_type: 'offline',
            prompt: 'consent', // Forces account selection to avoid sticky invalid sessions
        }
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
