import { Project } from '../types';

const DB_NAME = 'ndertimi_db';
const STORE_NAME = 'projects';
const DOC_KEY = 'all_projects_data';

export const dbService = {
  // Initialize the database
  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => {
        console.error("IndexedDB Error:", request.error);
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };
    });
  },

  // Save all projects
  async saveProjects(projects: Project[]): Promise<void> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(projects, DOC_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to save to DB:", err);
      throw err;
    }
  },

  // Get all projects
  async getProjects(): Promise<Project[] | null> {
    try {
      const db = await this.init();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(DOC_KEY);

        request.onsuccess = () => {
          resolve(request.result as Project[] || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to read from DB:", err);
      return null;
    }
  }
};
