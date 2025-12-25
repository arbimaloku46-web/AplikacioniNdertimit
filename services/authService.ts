
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
    // This ensures the email link redirects back to the correct environment (Localhost vs Production)
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
  
  try {
      const { data: result, error } = await supabase.auth.signUp({
        email: data.identifier.trim(),
        password: data.password.trim(),
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: data.fullName ? data.fullName.trim() : '',
            username: data.username ? data.username.trim() : '',
            is_admin: false,
          },
        },
      });

      if (error) throw error;
      
      // result.user might be null in very old clients, but standard checks cover it.
      if (!result.user) throw new Error('Registration failed: No user returned');

      console.log("Registration API Call Successful. Session active:", !!result.session);

      return {
        user: mapSupabaseUser(result.user),
        session: result.session
      };
  } catch (err: any) {
      console.error("Supabase SignUp Error:", err);
      
      // Handle "Failed to fetch" specifically (Network or Config issues)
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
          throw new Error('Connection failed. Please check your internet connection.');
      }
      
      throw err;
  }
};

export const resendVerificationEmail = async (email: string) => {
  const redirectUrl = getRedirectUrl();
  console.log("Resending verification to:", email);
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: {
      emailRedirectTo: redirectUrl
    }
  });

  if (error) throw error;
};

export const loginUser = async (identifier: string, password: string): Promise<User> => {
  try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password: password.trim(),
      });

      if (error) throw error;
      if (!data.user) throw new Error('Login failed');

      return mapSupabaseUser(data.user);
  } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
          throw new Error('Connection failed. Please check your internet connection.');
      }
      throw err;
  }
};

export const loginWithGoogle = async (): Promise<void> => {
  const redirectUrl = getRedirectUrl();
  console.log("Initiating Google Auth with redirect:", redirectUrl);
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
        redirectTo: redirectUrl,
        queryParams: {
            access_type: 'offline',
            prompt: 'consent',
        }
    }
  });

  if (error) throw error;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error signing out:', error);
};

export const getCurrentSession = async (): Promise<User | null> => {
  try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      return mapSupabaseUser(session.user);
  } catch (error) {
      console.error("Session check failed:", error);
      return null;
  }
};
