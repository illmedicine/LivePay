const DEFAULT_ENDPOINT = 'indexeddb'; // Use browser storage instead of server
let cachedEndpoint = DEFAULT_ENDPOINT;
let cachedPairingToken = '';

console.log('✨ LivePay Activity Stream Extension started');

chrome.storage.sync.get(['livepayEndpoint', 'livepayPairingToken'], (res) => {
  if (res && typeof res.livepayEndpoint === 'string' && res.livepayEndpoint.trim()) {
    cachedEndpoint = res.livepayEndpoint.trim();
  } else {
    cachedEndpoint = DEFAULT_ENDPOINT;
  }

  if (res && typeof res.livepayPairingToken === 'string' && res.livepayPairingToken.trim()) {
    cachedPairingToken = res.livepayPairingToken.trim();
  }
  
  console.log('🔧 LivePay config loaded - Endpoint:', cachedEndpoint);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') return;

  if (changes && changes.livepayEndpoint) {
    const next = changes.livepayEndpoint.newValue;
    if (typeof next === 'string' && next.trim()) {
      cachedEndpoint = next.trim();
    } else {
      cachedEndpoint = DEFAULT_ENDPOINT;
    }
  }

  if (changes && changes.livepayPairingToken) {
    const next = changes.livepayPairingToken.newValue;
    if (typeof next === 'string' && next.trim()) {
      cachedPairingToken = next.trim();
    } else {
      cachedPairingToken = '';
    }
  }
});

function postEvent(payload) {
  console.log('📊 LivePay: Posting event', payload);
  
  if (cachedEndpoint === 'indexeddb') {
    // Save to IndexedDB for GitHub Pages access
    const dbRequest = indexedDB.open('livepay-events', 1);
    
    dbRequest.onerror = () => {
      console.error('❌ LivePay: Failed to open IndexedDB', dbRequest.error);
    };
    
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('events')) {
        console.log('📦 LivePay: Creating IndexedDB object store');
        db.createObjectStore('events', { keyPath: 'id' });
      }
    };
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      const eventData = {
        ...payload,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        savedAt: Date.now(),
      };
      const addRequest = store.add(eventData);
      
      addRequest.onsuccess = () => {
        console.log('✅ LivePay: Event saved to IndexedDB', eventData.id);
      };
      
      addRequest.onerror = () => {
        console.error('❌ LivePay: Failed to save event', addRequest.error);
      };
    };
    return Promise.resolve();
  }
  
  // Fallback to HTTP endpoint if configured
  if (!cachedPairingToken) return Promise.resolve();
  return fetch(cachedEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${cachedPairingToken}`,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

function classify(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }

  const hostname = url.hostname || '';
  const domain = hostname.replace(/^www\./, '');

  if (
    domain === 'instagram.com' ||
    domain === 'snapchat.com' ||
    domain === 'facebook.com' ||
    domain === 'fb.com' ||
    domain === 'x.com' ||
    domain === 'twitter.com' ||
    domain === 'reddit.com'
  ) {
    const platform =
      domain === 'instagram.com'
        ? 'instagram'
        : domain === 'snapchat.com'
          ? 'snapchat'
          : domain === 'facebook.com' || domain === 'fb.com'
            ? 'facebook'
            : domain === 'reddit.com'
              ? 'reddit'
            : 'x';
    return { type: 'social_visit', platform, domain };
  }

  if (domain.includes('google.') && url.pathname === '/search') {
    const q = url.searchParams.get('q');
    if (q) {
      return { type: 'search', provider: 'google', query: q, domain };
    }
  }

  if (domain === 'youtube.com' || domain.endsWith('.youtube.com')) {
    if (url.pathname === '/watch') {
      const v = url.searchParams.get('v');
      if (v) {
        return { type: 'youtube_watch', videoId: v, domain };
      }
    }

    if (url.pathname.startsWith('/@')) {
      return { type: 'youtube_channel', handle: url.pathname.slice(1), domain };
    }

    return { type: 'social_visit', platform: 'youtube', domain };
  }

  return { type: 'visit', domain };
}


const lastSeenByTab = new Map();
const activeYouTubeWatchTabs = new Map();
let activeSocialTabId;
let activeSocialPlatform;
let activeSocialDomain;
const mediaPlayingByTab = new Map();

chrome.alarms.create('livepay-youtube-watch-minute', { periodInMinutes: 1 });
chrome.alarms.create('livepay-social-minute', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm || !alarm.name) return;

  if (alarm.name === 'livepay-youtube-watch-minute') {
    if (activeYouTubeWatchTabs.size === 0) return;
    postEvent({
      source: 'chrome',
      type: 'youtube_watch_minute',
      minutes: 1,
      domain: 'youtube.com',
    });
    return;
  }

  if (alarm.name === 'livepay-social-minute') {
    if (!activeSocialTabId || !activeSocialPlatform) return;
    const mediaPlaying = mediaPlayingByTab.get(activeSocialTabId) === true;
    postEvent({
      source: 'chrome',
      type: 'social_minute',
      platform: activeSocialPlatform,
      minutes: 1,
      mediaPlaying,
      domain: activeSocialDomain,
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  const tabId = sender && sender.tab ? sender.tab.id : undefined;
  if (!tabId) return;
  if (!msg || msg.type !== 'livepay_media_status') return;
  mediaPlayingByTab.set(tabId, msg.mediaPlaying === true);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  activeYouTubeWatchTabs.delete(tabId);
  lastSeenByTab.delete(tabId);
  mediaPlayingByTab.delete(tabId);
  if (activeSocialTabId === tabId) {
    activeSocialTabId = undefined;
    activeSocialPlatform = undefined;
    activeSocialDomain = undefined;
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    const payload = tab && tab.url ? classify(tab.url) : null;
    if (payload && payload.type === 'social_visit') {
      activeSocialTabId = tabId;
      activeSocialPlatform = payload.platform;
      activeSocialDomain = payload.domain;
    } else {
      activeSocialTabId = undefined;
      activeSocialPlatform = undefined;
      activeSocialDomain = undefined;
    }
  } catch {
    // ignore
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab || !tab.url) return;

  const url = tab.url;
  const last = lastSeenByTab.get(tabId);
  if (last === url) return;
  lastSeenByTab.set(tabId, url);

  const payload = classify(url);
  if (!payload) {
    console.log('🔗 LivePay: Unclassified URL', url);
    return;
  }

  console.log('🎯 LivePay: Tracking', payload.type, 'at', payload.domain);

  if (payload.type === 'youtube_watch') {
    activeYouTubeWatchTabs.set(tabId, payload.videoId);
  } else {
    activeYouTubeWatchTabs.delete(tabId);
  }

  if (payload.type === 'social_visit') {
    activeSocialTabId = tabId;
    activeSocialPlatform = payload.platform;
    activeSocialDomain = payload.domain;
  }

  postEvent({
    source: 'chrome',
    url,
    ...payload,
  });
});
