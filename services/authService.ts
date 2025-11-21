import { User } from '../types';

const STORAGE_KEY = 'ndertimi_users';

interface StoredUser extends User {
  password?: string;
}

// Simulate sending an email
const sendDatasheetEmail = async (user: User) => {
  console.log(`
    ---------------------------------------------------
    [MOCK EMAIL SERVER]
    To: arbimaloku46@gmail.com
    Subject: New Client Registration - Datasheet Update
    
    New Client Details:
    Name: ${user.name}
    Mobile: ${user.mobile}
    Timestamp: ${new Date().toISOString()}
    ---------------------------------------------------
  `);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
};

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

  // 5. "Send" the email to your gmail
  await sendDatasheetEmail(newUser);

  // Return user without password
  const { password: _, ...safeUser } = newUser;
  return safeUser;
};

export const loginUser = async (name: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay

  const existingData = localStorage.getItem(STORAGE_KEY);
  const users: StoredUser[] = existingData ? JSON.parse(existingData) : [];

  // Find user by Name (as requested) and Password
  // Note: In production, logging in by Name isn't unique, but we follow the requirement here.
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === password);

  if (!user) {
    throw new Error('Invalid name or password.');
  }

  const { password: _, ...safeUser } = user;
  return safeUser;
};

// Helper to get all registered users (for admin purposes if needed later)
export const getAllUsers = (): User[] => {
    const existingData = localStorage.getItem(STORAGE_KEY);
    return existingData ? JSON.parse(existingData) : [];
};