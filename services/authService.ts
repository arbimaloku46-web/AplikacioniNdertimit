import { User } from '../types';

const STORAGE_KEY = 'ndertimi_users_v2';

interface StoredUser extends User {
  password?: string;
}

export const registerUser = async (mobile: string, password: string, name: string): Promise<User> => {
  // 1. Get existing users
  const existingData = localStorage.getItem(STORAGE_KEY);
  const users: StoredUser[] = existingData ? JSON.parse(existingData) : [];

  // 2. Check if mobile already exists
  if (users.find(u => u.mobile === mobile)) {
    throw new Error('This mobile number is already registered.');
  }

  // 3. Create new user
  const newUser: StoredUser = { mobile, password, name };
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

  // Find user by Mobile and Password
  const user = users.find(u => u.mobile === mobile && u.password === password);

  if (!user) {
    throw new Error('Invalid mobile number or password.');
  }

  const { password: _, ...safeUser } = user;
  return safeUser;
};
