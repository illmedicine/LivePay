/**
 * Browser-based event storage for Chrome extension ↔ Web app communication
 * Uses IndexedDB to persist events without requiring a backend server
 */

const DB_NAME = 'livepay-events';
const STORE_NAME = 'events';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

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
    const index = store.index('timestamp');

    let request;
    if (since) {
      request = index.getAll(IDBKeyRange.lowerBound(since));
    } else {
      request = store.getAll();
    }

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

export async function watchEvents(callback: (events: any[]) => void): Promise<() => void> {
  await initBrowserStorage();

  // Initial load
  const events = await getEvents();
  callback(events);

  // Poll for new events every 500ms
  const interval = setInterval(async () => {
    const newEvents = await getEvents();
    callback(newEvents);
  }, 500);

  return () => clearInterval(interval);
}
