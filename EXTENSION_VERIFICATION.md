# Chrome Extension Verification Guide

## Quick Verification Steps

### Step 1: Check if Extension is Installed
1. Open Chrome → `chrome://extensions/`
2. Look for **"LivePay Activity Stream"** 
3. Verify **"Developer mode"** is ON (top-right toggle)
4. Should show version **0.1.0**
5. Should show enabled status (toggle ON)

### Step 2: Verify Extension is Running
1. Open DevTools: **F12** or **Right-click → Inspect**
2. Go to **Sources** tab
3. On the left sidebar, expand **Service workers** (or **Content scripts**)
4. You should see: `chrome-extension://[ID]/background.js` (running)

### Step 3: Check Extension is Tracking
1. Open **DevTools → Console** tab
2. Switch to the **Extension** scope (top-left of console)
3. Visit a website (e.g., github.com)
4. Do a Google search
5. Watch YouTube or visit Instagram

### Step 4: Verify Events Are Being Saved
1. **F12** → **Application** tab
2. Left sidebar → **IndexedDB** → **livepay-events** → **events**
3. You should see entries like:
```
{
  id: "1706615234567-a1b2c3d4"
  type: "visit"
  domain: "github.com"
  source: "chrome"
  savedAt: 1706615234567
}
```

### Step 5: Test Web App Connection
1. Go to: **https://illmedicine.github.io/LivePay**
2. Click **Ledger** tab
3. Open **DevTools → Application → IndexedDB** (same as above)
4. New events should appear in the database
5. **Ledger** should update with new entries like "Visited: github.com"

---

## Debugging Checklist

- [ ] Extension enabled in `chrome://extensions/`
- [ ] Service worker status shows "running"
- [ ] No error messages in console
- [ ] IndexedDB database exists (`livepay-events`)
- [ ] Events table contains activity events
- [ ] Web app successfully reads from IndexedDB
- [ ] Ledger tab displays new entries with sources

---

## Common Issues & Solutions

### **Extension not appearing in `chrome://extensions/`**
- Reload the page
- Make sure Developer mode is ON
- Try re-adding the extension:
  1. Go to `chrome://extensions/`
  2. Click **Load unpacked**
  3. Select `c:\Users\demar\Documents\GitHub\LivePay\chrome-extension-livepay`

### **Service Worker shows "error" or "inactive"**
1. Click **Details** under the extension
2. Check for error messages
3. Try disabling/re-enabling the extension
4. Hard reload: `Ctrl+Shift+R`

### **No events in IndexedDB**
1. Check Service Worker console for errors
2. Visit a website and watch console for activity
3. Look for `console.error('Failed to open IndexedDB')` messages

### **Ledger not updating**
1. Verify events exist in IndexedDB (see Step 4 above)
2. Hard refresh web app: `Ctrl+Shift+R`
3. Check web app console (F12) for errors
4. Make sure you're on https://illmedicine.github.io/LivePay (not localhost)

---

## Manual Test Activity

To verify tracking is working, do these actions and check IndexedDB:

1. **Visit a website**: Go to amazon.com, github.com, wikipedia.org
   - Should create event: `type: "visit", domain: "[website]"`

2. **Do a Google search**: Search "what is chrome"
   - Should create event: `type: "search", query: "[search term]"`

3. **Visit social media**: Go to instagram.com, twitter.com
   - Should create event: `type: "social_visit", platform: "[platform]"`

4. **Watch YouTube**: Play a YouTube video
   - Should create event: `type: "youtube_watch"`

5. **Shop online**: Search "laptop" on Google
   - Should create event: `type: "search"` + `commerceIntents: 1`

---

## Extension Code Overview

- **background.js**: Main service worker, tracks tabs and posts events to IndexedDB
- **social-media-detector.js**: Content script for detecting media playback on social platforms
- **manifest.json**: Permissions and configuration

## IndexedDB Database Structure

```
Database: livepay-events
├── Object Store: events
│   ├── Key Path: id
│   └── Indexes:
│       └── timestamp
│
├── Event Properties:
│   ├── id (auto-generated)
│   ├── type ("visit", "search", "social_visit", "youtube_watch", etc.)
│   ├── domain (e.g., "github.com")
│   ├── url (full URL)
│   ├── query (for searches)
│   ├── platform (for social media)
│   ├── minutes (for time tracking)
│   ├── mediaPlaying (boolean)
│   ├── source ("chrome")
│   └── savedAt (timestamp when saved)
```

---

**Ready to verify?** Follow the steps above and report what you see!
