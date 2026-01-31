/**
 * Browser-based event storage for Chrome extension ↔ Web app communication
 * Uses IndexedDB to persist events without requiring a backend server
 */

const DB_NAME = 'livepay-events';
const STORE_NAME = 'events';
const WALLET_STORE_NAME = 'wallet';
const DB_VERSION = 2; // Bumped to 2 for wallet store addition

let db: IDBDatabase | null = null;
let lastSeenTimestamp = 0;

export type WalletBalance = {
  id: 'balance';
  balance: number;
  lastUpdated: number;
  infraTotal?: number;
  treasuryTotal?: number;
};

export async function initBrowserStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    console.log('🔧 BrowserStorage: Opening IndexedDB with version', DB_VERSION);
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ BrowserStorage: Failed to open database', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      db = request.result;
      console.log('✅ BrowserStorage: Database opened successfully');
      console.log('📦 BrowserStorage: Object stores:', Array.from(db.objectStoreNames));
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      console.log('🔄 BrowserStorage: Upgrading database schema');
      const database = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion;
      console.log(`📊 BrowserStorage: Upgrade from v${oldVersion} to v${newVersion}`);
      
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        console.log('📦 BrowserStorage: Creating events store');
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!database.objectStoreNames.contains(WALLET_STORE_NAME)) {
        console.log('💳 BrowserStorage: Creating wallet store');
        database.createObjectStore(WALLET_STORE_NAME, { keyPath: 'id' });
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

export async function getWalletBalance(): Promise<WalletBalance> {
  const database = db || (await initBrowserStorage());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([WALLET_STORE_NAME], 'readonly');
    const store = transaction.objectStore(WALLET_STORE_NAME);
    const request = store.get('balance');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const wallet = request.result || { 
        id: 'balance', 
        balance: 0, 
        lastUpdated: Date.now(),
        infraTotal: 0,
        treasuryTotal: 0,
      };
      resolve(wallet);
    };
  });
}

export async function updateWalletBalance(amount: number): Promise<WalletBalance> {
  const database = db || (await initBrowserStorage());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([WALLET_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(WALLET_STORE_NAME);
    const getRequest = store.get('balance');

    getRequest.onerror = () => reject(getRequest.error);
    getRequest.onsuccess = () => {
      const current = getRequest.result || { 
        id: 'balance', 
        balance: 0, 
        lastUpdated: Date.now(),
        infraTotal: 0,
        treasuryTotal: 0,
      };
      const updated: WalletBalance = {
        ...current,
        balance: Math.round((current.balance + amount) * 10000) / 10000,
        lastUpdated: Date.now(),
      };
      const putRequest = store.put(updated);
      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve(updated);
    };
  });
}

export async function resetWalletBalance(): Promise<void> {
  const database = db || (await initBrowserStorage());
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([WALLET_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(WALLET_STORE_NAME);
    const wallet: WalletBalance = {
      id: 'balance',
      balance: 0,
      lastUpdated: Date.now(),
      infraTotal: 0,
      treasuryTotal: 0,
    };
    const request = store.put(wallet);
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
  console.log('👀 BrowserStorage: Starting to watch events');

  // Initial load
  const events = await getEvents();
  lastSeenTimestamp = Math.max(...events.map(e => e.savedAt || e.timestamp || 0), 0);
  console.log('🔍 BrowserStorage: Initial load - found', events.length, 'events, lastSeen:', lastSeenTimestamp);
  
  if (events.length > 0) {
    console.log('📝 BrowserStorage: Sample event:', events[0]);
  } else {
    console.log('ℹ️ BrowserStorage: No events found. Make sure the Chrome extension is running and capturing events.');
  }
  
  callback(events);

  // Poll for new events every 1000ms (reduced from 500ms to improve performance)
  const interval = window.setInterval(async () => {
    try {
      const newEvents = await getEvents();
      
      // Only call callback if there are new events since last check
      const hasNewEvents = newEvents.some(e => (e.savedAt || e.timestamp || 0) > lastSeenTimestamp);
      
      if (hasNewEvents) {
        lastSeenTimestamp = Math.max(...newEvents.map(e => e.savedAt || e.timestamp || 0), lastSeenTimestamp);
        console.log('🔄 BrowserStorage: Found', newEvents.length, 'events, new since last check');
        debounceCallback(callback, newEvents);
      }
    } catch (error) {
      console.error('❌ Error watching events:', error);
    }
  }, 1000); // Increased interval from 500ms to 1000ms

  return () => {
    clearInterval(interval);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  };
}
