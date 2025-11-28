
import { User, StoredUser } from '../types';
import { dbService } from './db';

export const registerUser = async (data: any): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

  const newUser: StoredUser = {
      uid: `user_${Date.now()}`,
      name: data.fullName,
      username: data.username,
      email: data.identifier, // Storing phone/email in email field for simplicity
      password: data.password,
      photoURL: null,
      isAdmin: false
  };

  return dbService.auth.register(newUser);
};

export const loginUser = async (identifier: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
  return dbService.auth.login(identifier, password);
};

export const loginWithGoogle = async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network popup delay
    
    // Simulate a successful Google Auth response
    // In a real app, this would come from Firebase/Auth0
    const mockGoogleProfile = {
        email: 'demo.user@gmail.com',
        name: 'Demo Google User'
    };

    return dbService.auth.googleAuth(mockGoogleProfile.email, mockGoogleProfile.name);
};

export const logoutUser = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
};
