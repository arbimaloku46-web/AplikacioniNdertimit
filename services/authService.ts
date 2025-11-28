

import { User } from '../types';

const STORAGE_KEY = 'ndertimi_users_v2';

interface StoredUser extends User {
  password?: string;
}

export const registerUser = async (mobile: string, password: string, name: string, countryCode: string): Promise<User> => {
  // 1. Get existing users
  const existingData = localStorage.getItem(STORAGE_KEY);
  const users: StoredUser[] = existingData ? JSON.parse(existingData) : [];
  
  // Clean mobile input
  const cleanMobile = mobile.replace(/\s/g, '');

  // 2. Check if mobile already exists
  if (users.find(u => u.mobile && u.mobile.replace(/\s/g, '') === cleanMobile)) {
    throw new Error('This mobile number is already registered.');
  }

  // 3. Create new user
  const newUser: StoredUser = { 
    mobile: cleanMobile, 
    password, 
    name, 
    countryCode,
    provider: 'local'
  };
  users.push(newUser);

  // 4. Save to local storage (Persistence)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));

  // Return user without password
  const { password: _, ...safeUser } = newUser;
  return safeUser;
};

export const loginUser = async (mobile: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Fake delay

  const existingData = localStorage.getItem(STORAGE_KEY);
  const users: StoredUser[] = existingData ? JSON.parse(existingData) : [];
  
  const cleanMobile = mobile.replace(/\s/g, '');

  // Find user by Mobile and Password
  const user = users.find(u => u.mobile && u.mobile.replace(/\s/g, '') === cleanMobile && u.password === password);

  if (!user) {
    throw new Error('Invalid mobile number or password.');
  }

  const { password: _, ...safeUser } = user;
  return safeUser;
};

// Simulated Google Login
export const loginWithGoogle = async (): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate popup delay

  const existingData = localStorage.getItem(STORAGE_KEY);
  const users: StoredUser[] = existingData ? JSON.parse(existingData) : [];

  const googleEmail = 'client@gmail.com'; // Simulated Google Email
  
  let user = users.find(u => u.email === googleEmail);

  if (!user) {
    // Auto-register if not exists
    user = {
      name: 'Google User',
      email: googleEmail,
      countryCode: 'AL',
      provider: 'google',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
    };
    users.push(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  const { password: _, ...safeUser } = user;
  return safeUser;
};