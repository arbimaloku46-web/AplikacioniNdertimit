
import { Project, StoredUser, User } from '../types';
import { MOCK_PROJECTS } from '../constants';

const PROJECTS_STORAGE_KEY = 'ndertimi_projects_db';
const USERS_STORAGE_KEY = 'ndertimi_users_db';

// Initialize Projects DB with mocks if empty
const initializeProjectsDB = (): Project[] => {
  const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(MOCK_PROJECTS));
    return MOCK_PROJECTS;
  }
  return JSON.parse(stored);
};

// Initialize Users DB
const initializeUsersDB = (): StoredUser[] => {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Simple event emitter for real-time updates within the same tab
const listeners: Set<(projects: Project[]) => void> = new Set();

const notifyListeners = () => {
  const projects = initializeProjectsDB();
  listeners.forEach(l => l(projects));
};

export const dbService = {
  // Real-time subscription simulation
  subscribeProjects(callback: (projects: Project[]) => void) {
    const projects = initializeProjectsDB();
    callback(projects);
    
    listeners.add(callback);
    
    // Check for storage events (multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PROJECTS_STORAGE_KEY) {
        notifyListeners();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      listeners.delete(callback);
      window.removeEventListener('storage', handleStorageChange);
    };
  },

  // Add new project
  async addProject(project: Project): Promise<void> {
    const projects = initializeProjectsDB();
    // Ensure ID is unique
    if (projects.find(p => p.id === project.id)) {
        throw new Error("Project ID exists");
    }
    projects.push(project);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    notifyListeners();
  },

  // Update existing project
  async updateProject(project: Project): Promise<void> {
    const projects = initializeProjectsDB();
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      projects[index] = project;
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
      notifyListeners();
    } else {
        throw new Error("Project not found");
    }
  },

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    const projects = initializeProjectsDB();
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filtered));
    notifyListeners();
  },

  // Upload file simulation
  async uploadFile(file: File, projectId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target?.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        } else {
            const url = URL.createObjectURL(file);
            resolve(url);
        }
    });
  },

  // --- AUTHENTICATION MOCK (Local Storage) ---
  auth: {
    async register(user: StoredUser): Promise<User> {
        const users = initializeUsersDB();
        
        // Check uniqueness
        if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase())) {
            throw new Error('Username is already taken');
        }
        if (users.some(u => u.email?.toLowerCase() === user.email?.toLowerCase())) {
            throw new Error('Phone number or Email is already registered');
        }

        users.push(user);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        
        // Return without password
        const { password, ...safeUser } = user;
        return safeUser;
    },

    async login(identifier: string, passwordAttempt: string): Promise<User> {
        const users = initializeUsersDB();
        
        const foundUser = users.find(u => 
            (u.username.toLowerCase() === identifier.toLowerCase() || 
             u.email?.toLowerCase() === identifier.toLowerCase()) && 
            u.password === passwordAttempt
        );

        if (!foundUser) {
            throw new Error('Invalid credentials');
        }

        const { password, ...safeUser } = foundUser;
        return safeUser;
    },

    async googleAuth(email: string, name: string): Promise<User> {
        const users = initializeUsersDB();
        const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            const { password, ...safeUser } = existingUser;
            return safeUser;
        }

        // Register new Google user
        const newUser: StoredUser = {
            uid: `google_${Date.now()}`,
            name: name,
            username: `user_${Math.floor(Math.random() * 10000)}`, // Generate random username
            email: email,
            password: `google_oauth_${Date.now()}`, // Dummy password
            photoURL: 'https://lh3.googleusercontent.com/a/default-user',
            isAdmin: false
        };

        users.push(newUser);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

        const { password, ...safeUser } = newUser;
        return safeUser;
    }
  }
};
