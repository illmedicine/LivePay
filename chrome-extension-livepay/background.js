const DEFAULT_ENDPOINT = 'indexeddb'; // Use browser storage instead of server
let cachedEndpoint = DEFAULT_ENDPOINT;
let cachedPairingToken = '';

console.log('✨ LivePay Activity Stream Extension started');

// Load domain classifier for pricing calculations
// This will be defined inline since we can't use ES6 imports in service worker
const pricingCategories = [
  {
    id: 'ad-driven-big-tech',
    name: 'Ad-Driven Big Tech',
    perActionPayoutMin: 0.0055,
    perActionPayoutMax: 0.0131,
  },
  {
    id: 'ai-subscription',
    name: 'AI Subscription Platforms',
    perActionPayoutMin: 0.0350,
    perActionPayoutMax: 0.1096,
  },
  {
    id: 'enterprise-ai',
    name: 'Enterprise AI / Automation',
    perActionPayoutMin: 0.0731,
    perActionPayoutMax: 0.3653,
  },
  {
    id: 'data-brokers',
    name: 'Data Brokers / Aggregators',
    perActionPayoutMin: 0.0001,
    perActionPayoutMax: 0.0004,
  },
  {
    id: 'people-search',
    name: 'People-Search / Retail Data',
    perActionPayoutMin: 0.0001,
    perActionPayoutMax: 0.0007,
  },
  {
    id: 'loyalty-financial',
    name: 'Loyalty / Financial Platforms',
    perActionPayoutMin: 0.0219,
    perActionPayoutMax: 0.0876,
  },
  {
    id: 'healthcare-risk',
    name: 'Healthcare / Risk Analytics',
    perActionPayoutMin: 0.1096,
    perActionPayoutMax: 0.4383,
  },
];

const domainCategoryMap = {
  'google.com': 'ad-driven-big-tech', 'google.co.uk': 'ad-driven-big-tech', 'google.ca': 'ad-driven-big-tech',
  'youtube.com': 'ad-driven-big-tech', 'facebook.com': 'ad-driven-big-tech', 'instagram.com': 'ad-driven-big-tech',
  'twitter.com': 'ad-driven-big-tech', 'x.com': 'ad-driven-big-tech', 'tiktok.com': 'ad-driven-big-tech',
  'reddit.com': 'ad-driven-big-tech', 'snapchat.com': 'ad-driven-big-tech', 'linkedin.com': 'ad-driven-big-tech',
  'pinterest.com': 'ad-driven-big-tech', 'bing.com': 'ad-driven-big-tech', 'yahoo.com': 'ad-driven-big-tech',
  'openai.com': 'ai-subscription', 'chat.openai.com': 'ai-subscription', 'chatgpt.com': 'ai-subscription',
  'anthropic.com': 'ai-subscription', 'claude.ai': 'ai-subscription', 'midjourney.com': 'ai-subscription',
  'copilot.microsoft.com': 'ai-subscription', 'bard.google.com': 'ai-subscription', 'gemini.google.com': 'ai-subscription',
  'character.ai': 'ai-subscription', 'jasper.ai': 'ai-subscription', 'copy.ai': 'ai-subscription',
  'salesforce.com': 'enterprise-ai', 'servicenow.com': 'enterprise-ai', 'workday.com': 'enterprise-ai',
  'oracle.com': 'enterprise-ai', 'sap.com': 'enterprise-ai', 'monday.com': 'enterprise-ai',
  'asana.com': 'enterprise-ai', 'slack.com': 'enterprise-ai', 'notion.so': 'enterprise-ai',
  'acxiom.com': 'data-brokers', 'experian.com': 'data-brokers', 'equifax.com': 'data-brokers',
  'transunion.com': 'data-brokers', 'liveramp.com': 'data-brokers',
  'amazon.com': 'people-search', 'walmart.com': 'people-search', 'target.com': 'people-search',
  'ebay.com': 'people-search', 'etsy.com': 'people-search', 'shopify.com': 'people-search',
  'whitepages.com': 'people-search', 'spokeo.com': 'people-search',
  'paypal.com': 'loyalty-financial', 'venmo.com': 'loyalty-financial', 'chase.com': 'loyalty-financial',
  'bankofamerica.com': 'loyalty-financial', 'wellsfargo.com': 'loyalty-financial', 'robinhood.com': 'loyalty-financial',
  'coinbase.com': 'loyalty-financial', 'creditkarma.com': 'loyalty-financial',
  'webmd.com': 'healthcare-risk', 'healthline.com': 'healthcare-risk', 'mayoclinic.org': 'healthcare-risk',
  'nih.gov': 'healthcare-risk', 'cdc.gov': 'healthcare-risk', 'unitedhealthcare.com': 'healthcare-risk',
  '23andme.com': 'healthcare-risk', 'ancestry.com': 'healthcare-risk',
};

function getPricingCategory(domain) {
  if (!domain) return null;
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  let categoryId = domainCategoryMap[normalizedDomain];
  if (!categoryId) {
    for (const [mappedDomain, catId] of Object.entries(domainCategoryMap)) {
      if (normalizedDomain.includes(mappedDomain) || normalizedDomain.endsWith(mappedDomain)) {
        categoryId = catId;
        break;
      }
    }
  }
  if (!categoryId) return null;
  return pricingCategories.find(cat => cat.id === categoryId) || null;
}

function calculatePayout(domain, actionType = 'visit') {
  const category = getPricingCategory(domain);
  if (!category) {
    return { userShare: 0.001, infra: 0.0002, treasury: 0.0001, total: 0.0013, categoryName: 'General Web Activity' };
  }
  const baseUserPayout = (category.perActionPayoutMin + category.perActionPayoutMax) / 2;
  let multiplier = 1.0;
  if (actionType === 'search') multiplier = 1.5;
  else if (actionType === 'minute') multiplier = 0.8;
  else if (actionType === 'interaction') multiplier = 1.2;
  
  const userShare = baseUserPayout * multiplier;
  const infra = userShare * 0.1875;
  const treasury = userShare * 0.0625;
  
  return {
    userShare: Math.round(userShare * 10000) / 10000,
    infra: Math.round(infra * 10000) / 10000,
    treasury: Math.round(treasury * 10000) / 10000,
    total: Math.round((userShare + infra + treasury) * 10000) / 10000,
    categoryName: category.name,
  };
}

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
  console.log('📊 LivePay: Posting event', JSON.stringify(payload).substring(0, 100));
  console.log('🔌 LivePay: Endpoint is:', cachedEndpoint);
  
  // Calculate payout based on domain and action type
  const domain = payload.domain;
  let actionType = 'visit';
  if (payload.type === 'search') actionType = 'search';
  else if (payload.type === 'youtube_watch_minute' || payload.type === 'social_minute') actionType = 'minute';
  else if (payload.type === 'social_visit' || payload.type === 'youtube_watch') actionType = 'interaction';
  
  const payout = calculatePayout(domain, actionType);
  
  // Add payout information to the payload
  const enrichedPayload = {
    ...payload,
    payout: {
      userShare: payout.userShare,
      infra: payout.infra,
      treasury: payout.treasury,
      total: payout.total,
      categoryName: payout.categoryName,
    },
  };
  
  console.log('💰 LivePay: Calculated payout', payout.total, 'USD -', payout.categoryName);
  
  if (cachedEndpoint === 'indexeddb') {
    console.log('💾 LivePay: Saving to IndexedDB');
    // Save to IndexedDB for GitHub Pages access
    const dbRequest = indexedDB.open('livepay-events', 2); // Version 2 for wallet store
    
    dbRequest.onerror = () => {
      console.error('❌ LivePay: Failed to open IndexedDB', dbRequest.error);
    };
    
    dbRequest.onupgradeneeded = (event) => {
      console.log('🔄 LivePay: Upgrading database schema');
      const db = event.target.result;
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion;
      console.log(`📊 LivePay: Upgrade from v${oldVersion} to v${newVersion}`);
      
      if (!db.objectStoreNames.contains('events')) {
        console.log('📦 LivePay: Creating IndexedDB events object store');
        db.createObjectStore('events', { keyPath: 'id' });
      }
      // Create wallet store if it doesn't exist
      if (!db.objectStoreNames.contains('wallet')) {
        console.log('💳 LivePay: Creating wallet object store');
        const walletStore = db.createObjectStore('wallet', { keyPath: 'id' });
        // Initialize wallet with zero balance
        console.log('💰 LivePay: Initializing wallet with zero balance');
      }
      console.log('✅ LivePay: Database upgrade complete');
    };
    
    dbRequest.onsuccess = (event) => {
      console.log('📂 LivePay: Database opened successfully');
      const db = event.target.result;
      const transaction = db.transaction(['events', 'wallet'], 'readwrite');
      const eventsStore = transaction.objectStore('events');
      const walletStore = transaction.objectStore('wallet');
      
      const now = Date.now();
      const eventData = {
        ...enrichedPayload,
        id: `${now}-${Math.random().toString(16).slice(2)}`,
        timestamp: now,
        savedAt: now,
      };
      
      console.log('💾 LivePay: Adding event to store:', eventData.id);
      const addRequest = eventsStore.add(eventData);
      
      addRequest.onsuccess = () => {
        console.log('✅ LivePay: Event saved to IndexedDB', eventData.id, 'Type:', eventData.type);
      };
      
      addRequest.onerror = () => {
        console.error('❌ LivePay: Failed to save event', addRequest.error, 'Code:', addRequest.error?.code);
      };
      
      // Update wallet balance
      const walletGetRequest = walletStore.get('balance');
      walletGetRequest.onsuccess = () => {
        const currentWallet = walletGetRequest.result || { id: 'balance', balance: 0, lastUpdated: now };
        const newBalance = (currentWallet.balance || 0) + payout.userShare;
        
        const updatedWallet = {
          id: 'balance',
          balance: Math.round(newBalance * 10000) / 10000,
          lastUpdated: now,
          infraTotal: (currentWallet.infraTotal || 0) + payout.infra,
          treasuryTotal: (currentWallet.treasuryTotal || 0) + payout.treasury,
        };
        
        walletStore.put(updatedWallet);
        console.log('💳 LivePay: Wallet updated - New balance:', updatedWallet.balance, 'USD');
      };
      
      transaction.onerror = () => {
        console.error('❌ LivePay: Transaction failed', transaction.error);
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
    body: JSON.stringify(enrichedPayload),
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
  console.log('🔄 LivePay: Tab updated - status:', changeInfo.status, 'URL:', tab?.url);
  
  if (changeInfo.status !== 'complete') {
    console.log('⏳ LivePay: Skipping - tab not fully loaded');
    return;
  }
  
  if (!tab || !tab.url) {
    console.log('⚠️ LivePay: Skipping - no URL available');
    return;
  }

  // Skip extension URLs
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
    console.log('🚫 LivePay: Skipping chrome system URL');
    return;
  }

  const url = tab.url;
  const last = lastSeenByTab.get(tabId);
  
  if (last === url) {
    console.log('⏭️ LivePay: Skipping - same URL as before');
    return;
  }
  
  lastSeenByTab.set(tabId, url);
  console.log('📝 LivePay: New URL tracked:', url);

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

console.log('✅ LivePay: chrome.tabs.onUpdated listener registered');

// For testing: listen for messages to manually inject events
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 LivePay: Received message:', message);
  if (message && message.type === 'TEST_EVENT') {
    console.log('🧪 LivePay: Injecting test event');
    postEvent({
      source: 'test',
      type: 'visit',
      domain: 'test.example.com',
    });
    sendResponse({ success: true });
  }
});

// Initial diagnostic log
console.log('✨ LivePay: Extension fully loaded with listeners registered');
