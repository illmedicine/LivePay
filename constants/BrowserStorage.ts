/**
 * Browser-based event storage for Chrome extension ↔ Web app communication
 * Uses IndexedDB to persist events without requiring a backend server
 */

const DB_NAME = 'livepay-events';
const STORE_NAME = 'events';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;
let lastSeenTimestamp = 0;

export async function initBrowserStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export async function saveEvent(event: any): Promise<void> {
  const database = db || (await initBrowserStorage());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const eventWithId = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      savedAt: Date.now(),
    };
    const request = store.add(eventWithId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getEvents(since?: number): Promise<any[]> {
  const database = db || (await initBrowserStorage());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const events = request.result || [];
      resolve(events.sort((a, b) => b.timestamp - a.timestamp));
    };
  });
}

export async function clearEvents(): Promise<void> {
  const database = db || (await initBrowserStorage());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Debounce wrapper to prevent excessive updates
let pendingCallback: ((events: any[]) => void) | null = null;
let debounceTimer: number | null = null;

function debounceCallback(callback: (events: any[]) => void, events: any[]) {
  pendingCallback = () => callback(events);
  
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = window.setTimeout(() => {
    if (pendingCallback) {
      pendingCallback(events);
      pendingCallback = null;
    }
    debounceTimer = null;
  }, 100); // Batch updates within 100ms
}

export async function watchEvents(callback: (events: any[]) => void): Promise<() => void> {
  await initBrowserStorage();

  // Initial load
  const events = await getEvents();
  lastSeenTimestamp = Math.max(...events.map(e => e.savedAt || 0), 0);
  callback(events);

  // Poll for new events every 1000ms (reduced from 500ms to improve performance)
  const interval = window.setInterval(async () => {
    try {
      const newEvents = await getEvents();
      
      // Only call callback if there are new events since last check
      const hasNewEvents = newEvents.some(e => (e.savedAt || 0) > lastSeenTimestamp);
      
      if (hasNewEvents) {
        lastSeenTimestamp = Math.max(...newEvents.map(e => e.savedAt || 0), lastSeenTimestamp);
        debounceCallback(callback, newEvents);
      }
    } catch (error) {
      console.error('Error watching events:', error);
    }
  }, 1000); // Increased interval from 500ms to 1000ms

  return () => {
    clearInterval(interval);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  };
}
