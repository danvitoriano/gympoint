// Robust storage using IndexedDB with localStorage fallback
export interface WorkoutLog {
  [date: string]: string;
}

class Storage {
  private dbName = 'GymLogDB';
  private storeName = 'workouts';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.warn('IndexedDB failed, falling back to localStorage');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async saveLog(log: WorkoutLog): Promise<void> {
    // Try IndexedDB first
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        await store.put({ id: 'gymLog', data: log, lastUpdated: Date.now() });
        return;
      } catch (error) {
        console.warn('IndexedDB save failed, using localStorage', error);
      }
    }

    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gymLog', JSON.stringify(log));
        localStorage.setItem('gymLog_lastUpdated', Date.now().toString());
      } catch (error) {
        console.error('Storage failed:', error);
      }
    }
  }

  async loadLog(): Promise<WorkoutLog> {
    // Try IndexedDB first
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get('gymLog');
        
        return new Promise((resolve) => {
          request.onsuccess = () => {
            if (request.result?.data) {
              resolve(request.result.data);
            } else {
              resolve(this.loadFromLocalStorage());
            }
          };
          request.onerror = () => resolve(this.loadFromLocalStorage());
        });
      } catch (error) {
        console.warn('IndexedDB load failed, using localStorage', error);
      }
    }

    return this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): WorkoutLog {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem('gymLog') || '{}');
    } catch {
      return {};
    }
  }

  async exportData(): Promise<string> {
    const log = await this.loadLog();
    const exportData = {
      version: 1,
      exportDate: new Date().toISOString(),
      workouts: log,
      totalWorkouts: Object.keys(log).length
    };
    return JSON.stringify(exportData, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const importData = JSON.parse(jsonData);
      if (importData.workouts && typeof importData.workouts === 'object') {
        await this.saveLog(importData.workouts);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    // Clear IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        await store.clear();
      } catch (error) {
        console.warn('IndexedDB clear failed', error);
      }
    }

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gymLog');
      localStorage.removeItem('gymLog_lastUpdated');
    }
  }
}

export const storage = new Storage(); 