# LivePay Troubleshooting Guide

## Issue: "Found 0 events" in BrowserStorage

### Quick Fixes

#### Option 1: Open the Debug Tool
1. Open `debug-indexeddb.html` in your browser
2. Click "🔍 Check Database" to verify database status
3. Click "➕ Add 10 Test Events" to populate with sample data
4. Refresh your LivePay app

#### Option 2: Clear and Reinitialize
```javascript
// Run in browser console
indexedDB.deleteDatabase('livepay-events');
// Then refresh the page
```

#### Option 3: Verify Chrome Extension
1. Go to `chrome://extensions`
2. Check that "LivePay Activity Stream" is enabled
3. Click the service worker link to see console
4. Visit a website (e.g., google.com)
5. Look for "✅ LivePay: Event saved to IndexedDB" messages

### Common Causes

**1. Database Version Mismatch**
- **Fix:** The database version was updated to 2. Clear browser cache and reload.

**2. Chrome Extension Not Running**
- **Fix:** Reload the extension in `chrome://extensions`
- Click the "Reload" button under the LivePay extension

**3. Service Worker Not Active**
- **Fix:** Click "service worker" link in chrome://extensions
- Check for errors in the console

**4. IndexedDB Disabled**
- **Fix:** Check browser settings → Privacy → Allow IndexedDB

### Verification Steps

1. **Check Database Exists:**
```javascript
// Run in browser console
indexedDB.databases().then(dbs => {
  console.log('Databases:', dbs);
  const lp = dbs.find(db => db.name === 'livepay-events');
  console.log('LivePay DB:', lp);
});
```

2. **Check Database Version:**
```javascript
const request = indexedDB.open('livepay-events');
request.onsuccess = (e) => {
  const db = e.target.result;
  console.log('Version:', db.version, 'Expected: 2');
  console.log('Stores:', Array.from(db.objectStoreNames));
  db.close();
};
```

3. **Check Events Count:**
```javascript
const request = indexedDB.open('livepay-events', 2);
request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction(['events'], 'readonly');
  const store = tx.objectStore('events');
  const countReq = store.count();
  countReq.onsuccess = () => {
    console.log('Events count:', countReq.result);
  };
};
```

### Manual Test Event Creation

```javascript
// Add a test event manually
const request = indexedDB.open('livepay-events', 2);
request.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction(['events', 'wallet'], 'readwrite');
  const eventsStore = tx.objectStore('events');
  const walletStore = tx.objectStore('wallet');
  
  const now = Date.now();
  const testEvent = {
    id: `${now}-test`,
    type: 'visit',
    domain: 'google.com',
    url: 'https://www.google.com',
    timestamp: now,
    savedAt: now,
    payout: {
      userShare: 0.0093,
      infra: 0.0017,
      treasury: 0.0006,
      total: 0.0116,
      categoryName: 'Ad-Driven Big Tech'
    }
  };
  
  eventsStore.add(testEvent);
  
  const walletReq = walletStore.get('balance');
  walletReq.onsuccess = () => {
    const wallet = walletReq.result || { 
      id: 'balance', 
      balance: 0, 
      infraTotal: 0, 
      treasuryTotal: 0, 
      lastUpdated: now 
    };
    wallet.balance += 0.0093;
    wallet.infraTotal += 0.0017;
    wallet.treasuryTotal += 0.0006;
    wallet.lastUpdated = now;
    walletStore.put(wallet);
  };
  
  tx.oncomplete = () => {
    console.log('✅ Test event added!');
    db.close();
  };
};
```

---

## Issue: "Some assets could not be cached" (Service Worker)

### Quick Fixes

**Option 1: Ignore It**
- This is a warning, not an error
- Service worker will still function
- Only affects offline mode

**Option 2: Clear Service Worker Cache**
1. Open DevTools → Application → Storage
2. Click "Clear site data"
3. Refresh the page

**Option 3: Update Service Worker**
1. Go to DevTools → Application → Service Workers
2. Click "Unregister"
3. Refresh the page

### Common Causes

**1. Assets Don't Exist**
- Some files referenced in cache list don't exist
- **Fix:** Not critical for functionality

**2. Network Issues**
- Assets couldn't be fetched during installation
- **Fix:** Refresh the page with good internet connection

**3. CORS Issues**
- External assets blocked by CORS
- **Fix:** External assets can't be cached, this is expected

### Verification

Check service worker status:
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
  regs.forEach(reg => {
    console.log('SW State:', reg.active?.state);
  });
});
```

---

## Still Having Issues?

### Complete Reset Procedure

1. **Clear Everything:**
```javascript
// Delete database
indexedDB.deleteDatabase('livepay-events');

// Unregister service workers
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// Clear cache
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

2. **Reload Extension:**
- Go to `chrome://extensions`
- Click reload under LivePay extension

3. **Refresh App:**
- Close all tabs
- Reopen LivePay app
- Visit google.com to trigger first event

### Enable Detailed Logging

Add to browser console to see all events:
```javascript
// Enable verbose logging
localStorage.setItem('livepay-debug', 'true');

// Watch for new events
setInterval(async () => {
  const db = await new Promise((resolve) => {
    const req = indexedDB.open('livepay-events', 2);
    req.onsuccess = (e) => resolve(e.target.result);
  });
  const tx = db.transaction(['events'], 'readonly');
  const req = tx.objectStore('events').getAll();
  req.onsuccess = () => {
    console.log('📊 Total events:', req.result.length);
    if (req.result.length > 0) {
      console.log('Latest event:', req.result[req.result.length - 1]);
    }
  };
}, 2000);
```

---

## Expected Behavior

When working correctly, you should see:

### Chrome Extension Console:
```
✨ LivePay Activity Stream Extension started
🔧 LivePay config loaded - Endpoint: indexeddb
📊 LivePay: Posting event {"type":"visit","domain":"google.com"...
💰 LivePay: Calculated payout 0.0093 USD - Ad-Driven Big Tech
💾 LivePay: Saving to IndexedDB
🔄 LivePay: Upgrading database schema (if first time)
📦 LivePay: Creating IndexedDB events object store
💳 LivePay: Creating wallet object store
✅ LivePay: Database upgrade complete
📂 LivePay: Database opened successfully
💾 LivePay: Adding event to store
✅ LivePay: Event saved to IndexedDB
💳 LivePay: Wallet updated - New balance: 0.0093 USD
```

### App Console:
```
🔧 BrowserStorage: Opening IndexedDB with version 2
✅ BrowserStorage: Database opened successfully
📦 BrowserStorage: Object stores: events,wallet
👀 BrowserStorage: Starting to watch events
🔍 BrowserStorage: Initial load - found 1 events, lastSeen: 1738368000000
📝 BrowserStorage: Sample event: {type: "visit", domain: "google.com", ...}
```

---

## Need More Help?

1. **Use the Debug Tool:** Open `debug-indexeddb.html` for visual debugging
2. **Check Console:** Look for red errors in browser console
3. **Verify Extension:** Check chrome://extensions for errors
4. **Test Manually:** Use the manual test scripts above

The issue you're seeing ("Found 0 events") typically means:
- Chrome extension hasn't captured any events yet
- Database needs to be initialized
- Version mismatch needs database upgrade

**Quick Solution:** Open `debug-indexeddb.html` and click "Add 10 Test Events" to get started!
