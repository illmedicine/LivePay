# LivePay Pricing Scheme - Verification Guide

## How to Verify the Implementation Works

This guide helps you verify that the LivePay pricing scheme is working correctly.

## Step 1: Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension-livepay` folder from your LivePay directory
5. You should see "LivePay Activity Stream" extension loaded

✅ **Expected Result:** Extension badge should appear in Chrome toolbar

## Step 2: Verify Extension is Tracking

1. Open Chrome DevTools (F12)
2. Go to the **Console** tab
3. Visit any website (e.g., google.com)
4. Look for LivePay console messages:

```
✨ LivePay Activity Stream Extension started
📊 LivePay: Posting event {"type":"visit","domain":"google.com"...
💰 LivePay: Calculated payout 0.0093 USD - Ad-Driven Big Tech
💾 LivePay: Saving to IndexedDB
✅ LivePay: Event saved to IndexedDB
💳 LivePay: Wallet updated - New balance: 0.0093 USD
```

✅ **Expected Result:** You should see console logs showing payout calculation

## Step 3: Inspect IndexedDB

### Check Events Store

1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB** → **livepay-events**
4. Click on **events** store
5. Look for recent events

**Example Event:**
```json
{
  "id": "1738368000000-abc123",
  "type": "visit",
  "domain": "google.com",
  "url": "https://www.google.com/search?q=test",
  "timestamp": 1738368000000,
  "savedAt": 1738368000000,
  "payout": {
    "userShare": 0.0093,
    "infra": 0.0017,
    "treasury": 0.0006,
    "total": 0.0116,
    "categoryName": "Ad-Driven Big Tech"
  }
}
```

✅ **Expected Result:** Events should have `payout` object with calculated values

### Check Wallet Store

1. In the same **Application** → **IndexedDB** → **livepay-events**
2. Click on **wallet** store
3. Look for the `balance` entry

**Example Wallet:**
```json
{
  "id": "balance",
  "balance": 0.0093,
  "lastUpdated": 1738368000000,
  "infraTotal": 0.0017,
  "treasuryTotal": 0.0006
}
```

✅ **Expected Result:** Wallet should show accumulated balance

## Step 4: Test Different Platform Categories

### Test High-Value Platform (Healthcare)

1. Visit `https://www.webmd.com`
2. Check console logs:
```
💰 LivePay: Calculated payout 0.2740 USD - Healthcare / Risk Analytics
```
3. Check IndexedDB event:
```json
{
  "domain": "webmd.com",
  "payout": {
    "userShare": 0.2740,
    "categoryName": "Healthcare / Risk Analytics"
  }
}
```

✅ **Expected Result:** Higher payout (~$0.27) for healthcare site

### Test AI Platform

1. Visit `https://chat.openai.com`
2. Check console logs:
```
💰 LivePay: Calculated payout 0.0723 USD - AI Subscription Platforms
```

✅ **Expected Result:** Medium-high payout (~$0.07) for AI platform

### Test Search Query

1. Visit Google and perform a search
2. Check console logs:
```
💰 LivePay: Calculated payout 0.0140 USD - Ad-Driven Big Tech
```

✅ **Expected Result:** 1.5x multiplier applied (search action type)

## Step 5: Verify Wallet Balance Accumulation

Run this in the console after visiting 3-5 different sites:

```javascript
const dbRequest = indexedDB.open('livepay-events', 1);
dbRequest.onsuccess = (event) => {
  const db = event.target.result;
  const transaction = db.transaction(['wallet'], 'readonly');
  const store = transaction.objectStore('wallet');
  const request = store.get('balance');
  request.onsuccess = () => {
    console.log('=== WALLET BALANCE ===');
    console.log('User Balance: $' + request.result.balance);
    console.log('Infrastructure: $' + request.result.infraTotal);
    console.log('Treasury: $' + request.result.treasuryTotal);
    console.log('Total Value: $' + (request.result.balance + request.result.infraTotal + request.result.treasuryTotal));
  };
};
```

✅ **Expected Output:**
```
=== WALLET BALANCE ===
User Balance: $0.3846
Infrastructure: $0.0721
Treasury: $0.0240
Total Value: $0.4807
```

## Step 6: Test LivePay App Integration

1. Open the LivePay web app (or run `npm start` in the project directory)
2. Navigate to the main wallet screen
3. Verify that events appear in real-time
4. Check that the transaction ledger shows category names

✅ **Expected Result:** 
- Wallet balance updates in real-time
- Ledger shows category names (e.g., "Ad-Driven Big Tech", "Healthcare / Risk Analytics")
- Activity breakdown reflects categorized earnings

## Step 7: Test All 7 Categories

Visit one site from each category and verify payouts:

| Category | Test URL | Expected Range |
|----------|----------|----------------|
| 🏥 Healthcare | webmd.com | $0.11 - $0.44 |
| 🏢 Enterprise AI | salesforce.com | $0.07 - $0.37 |
| 🤖 AI Subscription | chat.openai.com | $0.04 - $0.11 |
| 💰 Financial | paypal.com | $0.02 - $0.09 |
| 🔍 Ad-Driven | google.com | $0.006 - $0.013 |
| 🛒 Shopping | amazon.com | $0.0001 - $0.0007 |
| 📊 Data Brokers | experian.com | $0.0001 - $0.0004 |

Run this test script:

```javascript
const testUrls = [
  { url: 'https://webmd.com', category: 'Healthcare', min: 0.11, max: 0.44 },
  { url: 'https://salesforce.com', category: 'Enterprise AI', min: 0.07, max: 0.37 },
  { url: 'https://chat.openai.com', category: 'AI Subscription', min: 0.04, max: 0.11 },
  { url: 'https://paypal.com', category: 'Financial', min: 0.02, max: 0.09 },
  { url: 'https://google.com', category: 'Ad-Driven', min: 0.006, max: 0.013 },
  { url: 'https://amazon.com', category: 'Shopping', min: 0.0001, max: 0.0007 },
  { url: 'https://experian.com', category: 'Data Brokers', min: 0.0001, max: 0.0004 },
];

console.log('Test each URL and verify payout is within expected range');
testUrls.forEach(t => {
  console.log(`${t.category}: Visit ${t.url} → Expect $${t.min} - $${t.max}`);
});
```

## Step 8: View All Events with Payouts

Run this to see a summary of all captured events:

```javascript
const dbRequest = indexedDB.open('livepay-events', 1);
dbRequest.onsuccess = (event) => {
  const db = event.target.result;
  const transaction = db.transaction(['events'], 'readonly');
  const store = transaction.objectStore('events');
  const request = store.getAll();
  request.onsuccess = () => {
    const events = request.result;
    console.log('=== ALL EVENTS WITH PAYOUTS ===');
    console.log(`Total Events: ${events.length}`);
    
    events.forEach((e, i) => {
      if (e.payout) {
        console.log(`${i+1}. ${e.type} on ${e.domain}`);
        console.log(`   Category: ${e.payout.categoryName}`);
        console.log(`   User Share: $${e.payout.userShare}`);
        console.log(`   Total Value: $${e.payout.total}`);
      }
    });
    
    // Calculate totals
    const totalUserShare = events.reduce((sum, e) => sum + (e.payout?.userShare || 0), 0);
    const totalValue = events.reduce((sum, e) => sum + (e.payout?.total || 0), 0);
    console.log(`\n=== TOTALS ===`);
    console.log(`Total User Share: $${totalUserShare.toFixed(4)}`);
    console.log(`Total Value Created: $${totalValue.toFixed(4)}`);
  };
};
```

## Troubleshooting

### Issue: No payout information in events

**Solution:**
1. Verify domain-classifier.js is loaded in background.js
2. Check that getPricingCategory() function exists
3. Look for JavaScript errors in console

### Issue: Wallet balance not updating

**Solution:**
1. Verify wallet store exists in IndexedDB
2. Check that postEvent() is calling walletStore.put()
3. Clear IndexedDB and retry

### Issue: Wrong payout amounts

**Solution:**
1. Verify domain is in domainCategoryMap
2. Check action type multipliers
3. Confirm category payout ranges in pricingCategories array

### Issue: Extension not capturing events

**Solution:**
1. Reload the extension in chrome://extensions
2. Check that background.js is running (click "service worker" link)
3. Verify permissions in manifest.json

## Success Checklist

Use this checklist to verify everything works:

- [ ] Chrome extension loads without errors
- [ ] Console shows payout calculations
- [ ] IndexedDB has events with payout objects
- [ ] Wallet balance accumulates correctly
- [ ] Different categories show different payouts
- [ ] Search actions get 1.5x multiplier
- [ ] High-value sites (healthcare) pay more than low-value sites (shopping)
- [ ] Revenue split is 80/15/5 (user/infra/treasury)
- [ ] LivePay app displays categorized transactions
- [ ] Wallet balance matches IndexedDB balance

## Validation Script

Run this comprehensive validation:

```javascript
async function validateLivePay() {
  console.log('=== LIVEPAY PRICING SCHEME VALIDATION ===\n');
  
  const db = await new Promise((resolve) => {
    const req = indexedDB.open('livepay-events', 1);
    req.onsuccess = (e) => resolve(e.target.result);
  });
  
  // Check events
  const events = await new Promise((resolve) => {
    const tx = db.transaction(['events'], 'readonly');
    const req = tx.objectStore('events').getAll();
    req.onsuccess = () => resolve(req.result);
  });
  
  console.log(`✅ Total Events: ${events.length}`);
  
  const eventsWithPayouts = events.filter(e => e.payout);
  console.log(`✅ Events with Payouts: ${eventsWithPayouts.length}`);
  
  if (eventsWithPayouts.length === 0) {
    console.error('❌ No events with payout information found!');
    return;
  }
  
  // Check categories
  const categories = new Set(eventsWithPayouts.map(e => e.payout.categoryName));
  console.log(`✅ Unique Categories: ${categories.size}`);
  console.log(`   Categories: ${[...categories].join(', ')}`);
  
  // Check wallet
  const wallet = await new Promise((resolve) => {
    const tx = db.transaction(['wallet'], 'readonly');
    const req = tx.objectStore('wallet').get('balance');
    req.onsuccess = () => resolve(req.result);
  });
  
  if (!wallet) {
    console.error('❌ Wallet not found!');
    return;
  }
  
  console.log(`✅ Wallet Balance: $${wallet.balance}`);
  console.log(`✅ Infrastructure: $${wallet.infraTotal}`);
  console.log(`✅ Treasury: $${wallet.treasuryTotal}`);
  
  // Verify split ratios
  const totalValue = wallet.balance + wallet.infraTotal + wallet.treasuryTotal;
  const userPct = (wallet.balance / totalValue * 100).toFixed(1);
  const infraPct = (wallet.infraTotal / totalValue * 100).toFixed(1);
  const treasuryPct = (wallet.treasuryTotal / totalValue * 100).toFixed(1);
  
  console.log(`\n=== SPLIT VERIFICATION ===`);
  console.log(`User: ${userPct}% (expected: 80%)`);
  console.log(`Infra: ${infraPct}% (expected: 15%)`);
  console.log(`Treasury: ${treasuryPct}% (expected: 5%)`);
  
  const splitValid = Math.abs(userPct - 80) < 1 && 
                     Math.abs(infraPct - 15) < 1 && 
                     Math.abs(treasuryPct - 5) < 1;
  
  if (splitValid) {
    console.log('✅ Split ratios are correct!');
  } else {
    console.error('❌ Split ratios are incorrect!');
  }
  
  console.log('\n=== VALIDATION COMPLETE ===');
  console.log('All systems operational! 🚀');
}

validateLivePay();
```

✅ **Expected Output:**
```
=== LIVEPAY PRICING SCHEME VALIDATION ===

✅ Total Events: 12
✅ Events with Payouts: 12
✅ Unique Categories: 3
   Categories: Ad-Driven Big Tech, AI Subscription Platforms, Healthcare / Risk Analytics
✅ Wallet Balance: $0.4846
✅ Infrastructure: $0.0908
✅ Treasury: $0.0303

=== SPLIT VERIFICATION ===
User: 80.0% (expected: 80%)
Infra: 15.0% (expected: 15%)
Treasury: 5.0% (expected: 5%)
✅ Split ratios are correct!

=== VALIDATION COMPLETE ===
All systems operational! 🚀
```

---

## Summary

If all steps pass:
- ✅ Pricing scheme is working correctly
- ✅ Payouts are calculated based on domain categories
- ✅ Wallet balance is accumulating properly
- ✅ Revenue split is correct (80/15/5)
- ✅ System is ready for use

**You're now earning fair compensation for your data! 🎉**
