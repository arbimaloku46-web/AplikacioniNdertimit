
import { Project, StoredUser, User, MediaItem } from '../types';

const DB_NAME = 'NdertimiDB';
const DB_VERSION = 2;
const STORE_PROJECTS = 'projects';
const STORE_FILES = 'files';
const USERS_STORAGE_KEY = 'ndertimi_users_db';
const LEGACY_PROJECTS_KEY = 'ndertimi_projects_db';

// --- IndexedDB Helpers ---

let dbPromise: Promise<IDBDatabase> | null = null;

const openDB = () => {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        // Files store: Key is the file ID (string), value is the Blob/File
        db.createObjectStore(STORE_FILES); 
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  
  return dbPromise;
};

const getStore = async (storeName: string, mode: IDBTransactionMode) => {
  const db = await openDB();
  return db.transaction(storeName, mode).objectStore(storeName);
};

// --- Blob URL Management ---
// We need to map opaque blob: URLs back to their database IDs for persistence
const blobToIdMap = new Map<string, string>();
const idToBlobMap = new Map<string, string>();

const registerBlob = (id: string, blob: Blob): string => {
  // If we already have a live URL for this ID, return it
  if (idToBlobMap.has(id)) {
    return idToBlobMap.get(id)!;
  }
  
  const url = URL.createObjectURL(blob);
  blobToIdMap.set(url, id);
  idToBlobMap.set(id, url);
  return url;
};

// --- Data Transformation ---

// Convert "file_..." IDs in the project object to usable blob: URLs
const hydrateProject = async (project: Project): Promise<Project> => {
  const p = JSON.parse(JSON.stringify(project)); // Deep clone
  
  const processMedia = async (media: MediaItem) => {
    if (media.url && media.url.startsWith('file_')) {
      const fileId = media.url;
      try {
        // Check cache first
        if (idToBlobMap.has(fileId)) {
          media.url = idToBlobMap.get(fileId)!;
        } else {
            const store = await getStore(STORE_FILES, 'readonly');
            const request = store.get(fileId);
            
            const blob = await new Promise<Blob>((resolve) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(new Blob([])); // Fallback
            });

            if (blob) {
                media.url = registerBlob(fileId, blob);
            }
        }
      } catch (e) {
        console.error("Failed to hydrate file", fileId, e);
      }
    }
    
    if (media.thumbnail && media.thumbnail.startsWith('file_')) {
        const fileId = media.thumbnail;
        // Reuse logic or simple check (thumbnails usually same as url for photos)
        if (idToBlobMap.has(fileId)) {
            media.thumbnail = idToBlobMap.get(fileId)!;
        } else {
            // Lazy load thumbnail if different (omitted for brevity, assuming main logic covers most cases)
        }
    }
  };

  for (const update of p.updates) {
    if (update.media) {
        await Promise.all(update.media.map(processMedia));
    }
  }
  
  return p;
};

// Convert blob: URLs back to "file_..." IDs before saving
const dehydrateProject = (project: Project): Project => {
  const p = JSON.parse(JSON.stringify(project));
  
  const processMedia = (media: MediaItem) => {
    if (media.url && blobToIdMap.has(media.url)) {
      media.url = blobToIdMap.get(media.url)!;
    }
    if (media.thumbnail && blobToIdMap.has(media.thumbnail)) {
        media.thumbnail = blobToIdMap.get(media.thumbnail)!;
    }
  };

  p.updates.forEach((update: any) => {
    if (update.media) {
        update.media.forEach(processMedia);
    }
  });

  return p;
};

// --- Migration Logic ---
const migrateLegacyData = async () => {
    try {
        const legacyData = localStorage.getItem(LEGACY_PROJECTS_KEY);
        if (legacyData) {
            console.log('Detected legacy localStorage data. Migrating to IndexedDB...');
            const projects = JSON.parse(legacyData);
            if (Array.isArray(projects) && projects.length > 0) {
                 const store = await getStore(STORE_PROJECTS, 'readwrite');
                 // Only migrate if DB is empty to prevent overwriting newer data
                 const countRequest = store.count();
                 
                 await new Promise<void>((resolve) => {
                     countRequest.onsuccess = () => {
                         if (countRequest.result === 0) {
                             projects.forEach(p => store.put(dehydrateProject(p)));
                             console.log(`Migrated ${projects.length} projects successfully.`);
                         }
                         resolve();
                     };
                     countRequest.onerror = () => resolve();
                 });
            }
            // Clear legacy storage to release quota
            localStorage.removeItem(LEGACY_PROJECTS_KEY);
            console.log('Legacy localStorage cleared.');
        }
    } catch (e) {
        console.error("Migration failed", e);
    }
};

// --- DB Service Implementation ---

const listeners: Set<(projects: Project[]) => void> = new Set();
let isMigrated = false;

const notifyListeners = async () => {
  try {
    const store = await getStore(STORE_PROJECTS, 'readonly');
    const request = store.getAll();
    
    request.onsuccess = async () => {
      const rawProjects = request.result as Project[];
      // Hydrate all projects (resolve blob URLs)
      const hydratedProjects = await Promise.all(rawProjects.map(hydrateProject));
      listeners.forEach(l => l(hydratedProjects));
    };
  } catch (err) {
    console.error("Error notifying listeners", err);
  }
};

export const dbService = {
  subscribeProjects(callback: (projects: Project[]) => void) {
    const init = async () => {
        if (!isMigrated) {
            await migrateLegacyData();
            isMigrated = true;
        }
        notifyListeners();
    };

    init();
    
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },

  async addProject(project: Project): Promise<void> {
    const store = await getStore(STORE_PROJECTS, 'readwrite');
    const dehydrated = dehydrateProject(project);
    store.put(dehydrated);
    // Transaction auto-commits
    await new Promise(resolve => setTimeout(resolve, 100)); // microtask delay
    notifyListeners();
  },

  async updateProject(project: Project): Promise<void> {
    const store = await getStore(STORE_PROJECTS, 'readwrite');
    const dehydrated = dehydrateProject(project);
    store.put(dehydrated);
    await new Promise(resolve => setTimeout(resolve, 100));
    notifyListeners();
  },

  async deleteProject(projectId: string): Promise<void> {
    const store = await getStore(STORE_PROJECTS, 'readwrite');
    store.delete(projectId);
    await new Promise(resolve => setTimeout(resolve, 100));
    notifyListeners();
  },

  async uploadFile(file: File, projectId: string): Promise<string> {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const store = await getStore(STORE_FILES, 'readwrite');
    store.put(file, fileId);
    
    // Register mapping immediately so it's available for the UI
    const blobUrl = registerBlob(fileId, file);
    return blobUrl;
  },

  // --- AUTH (Kept in LocalStorage for simplicity as User data is small) ---
  auth: {
    initializeUsersDB(): StoredUser[] {
        const stored = localStorage.getItem(USERS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    },

    async register(user: StoredUser): Promise<User> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const users = this.initializeUsersDB();
        
        if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase())) {
            throw new Error('Username is already taken');
        }
        if (users.some(u => u.email?.toLowerCase() === user.email?.toLowerCase())) {
            throw new Error('Phone/Email is already registered');
        }

        users.push(user);
        try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {
            // Fallback if local storage is somehow still full
            throw new Error('Storage full. Please clear space on your device.');
        }
        
        const { password, ...safeUser } = user;
        return safeUser;
    },

    async login(identifier: string, passwordAttempt: string): Promise<User> {
        await new Promise(resolve => setTimeout(resolve, 500));
        const users = this.initializeUsersDB();
        
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
        await new Promise(resolve => setTimeout(resolve, 500));
        const users = this.initializeUsersDB();
        const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            const { password, ...safeUser } = existingUser;
            return safeUser;
        }

        const newUser: StoredUser = {
            uid: `google_${Date.now()}`,
            name: name,
            username: `user_${Math.floor(Math.random() * 10000)}`,
            email: email,
            password: `google_oauth_${Date.now()}`,
            photoURL: 'https://lh3.googleusercontent.com/a/default-user',
            isAdmin: false
        };

        users.push(newUser);
        try {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        } catch (e) {
            throw new Error('Storage full.');
        }

        const { password, ...safeUser } = newUser;
        return safeUser;
    }
  }
};
