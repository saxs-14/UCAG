/**
 * Firebase Configuration for Mpumi Educational Ecosystem
 * Houses Authentication, Firestore for live chats, and Real-time notifications.
 */

// Simulation/mock configuration template
// In production, populate the environment variables in a .env file.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key-mpumi-ucag",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ucag-mpumi.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ucag-mpumi",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ucag-mpumi.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:000000000000",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-MOCKMEASURE"
};

// Simulated Firebase client for fully functional client-side offline-first demonstration
class MockFirebaseDB {
  private listeners: { [key: string]: Function[] } = {};

  // Simulated Firestore Collection
  collection(name: string) {
    return {
      doc: (id: string) => ({
        set: async (data: any) => {
          localStorage.setItem(`firebase_${name}_${id}`, JSON.stringify(data));
          this.trigger(name, { id, ...data });
          return { success: true };
        },
        get: async () => {
          const item = localStorage.getItem(`firebase_${name}_${id}`);
          return item ? { exists: true, data: () => JSON.parse(item) } : { exists: false };
        }
      }),
      add: async (data: any) => {
        const id = Math.random().toString(36).substr(2, 9);
        localStorage.setItem(`firebase_${name}_${id}`, JSON.stringify(data));
        this.trigger(name, { id, ...data });
        return { id };
      },
      onSnapshot: (callback: Function) => {
        if (!this.listeners[name]) this.listeners[name] = [];
        this.listeners[name].push(callback);
        // Load initial data
        const items: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`firebase_${name}_`)) {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            items.push({ id: key.replace(`firebase_${name}_`, ''), ...data });
          }
        }
        callback(items);
        return () => {
          this.listeners[name] = this.listeners[name].filter(cb => cb !== callback);
        };
      }
    };
  }

  private trigger(name: string, _data: any) {
    if (this.listeners[name]) {
      // Refresh items list
      const items: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`firebase_${name}_`)) {
          const itemData = JSON.parse(localStorage.getItem(key) || '{}');
          items.push({ id: key.replace(`firebase_${name}_`, ''), ...itemData });
        }
      }
      this.listeners[name].forEach(callback => callback(items));
    }
  }
}

export const mockFirebase = new MockFirebaseDB();
