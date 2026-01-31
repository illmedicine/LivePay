# LivePay Pricing Scheme

## Overview

LivePay now includes a dynamic pricing scheme that calculates user payouts based on the actual value created by different domains and platforms. This feature ensures users are compensated fairly based on industry-standard valuations for different types of data and interactions.

## Pricing Categories

The pricing scheme includes 7 major categories based on annual value created per person:

### 1. Ad-Driven Big Tech (Search, Social, Video)
- **Annual Value:** $250 - $600
- **User Share (80%):** $200 - $480
- **Per-Action Payout:** $0.0055 - $0.0131
- **Examples:** Google, YouTube, Facebook, Instagram, Twitter/X, TikTok, Reddit, LinkedIn, Pinterest

### 2. AI Subscription Platforms (LLMs, copilots, creative AI)
- **Annual Value:** $800 - $2,500
- **User Share (80%):** $640 - $2,000
- **Per-Action Payout:** $0.0350 - $0.1096
- **Examples:** ChatGPT, Claude.ai, Midjourney, Microsoft Copilot, Gemini, Character.ai, Jasper.ai

### 3. Enterprise AI / Automation
- **Annual Value:** $1,000 - $5,000
- **User Share (80%):** $800 - $4,000
- **Per-Action Payout:** $0.0731 - $0.3653
- **Examples:** Salesforce, ServiceNow, Workday, Oracle, SAP, Monday.com, Asana, Slack, Notion

### 4. Data Brokers / Aggregators
- **Annual Value:** $5 - $20
- **User Share (80%):** $4 - $16
- **Per-Action Payout:** $0.0001 - $0.0004
- **Examples:** Acxiom, Experian, Equifax, TransUnion, LiveRamp

### 5. People-Search / Retail Data
- **Annual Value:** $10 - $50
- **User Share (80%):** $8 - $40
- **Per-Action Payout:** $0.0001 - $0.0007
- **Examples:** Amazon, Walmart, Target, eBay, Etsy, Whitepages, Spokeo

### 6. Loyalty / Financial Platforms
- **Annual Value:** $200 - $800
- **User Share (80%):** $160 - $640
- **Per-Action Payout:** $0.0219 - $0.0876
- **Examples:** PayPal, Venmo, Chase, Bank of America, Robinhood, Coinbase, CreditKarma

### 7. Healthcare / Risk Analytics
- **Annual Value:** $500 - $2,000
- **User Share (80%):** $400 - $1,600
- **Per-Action Payout:** $0.1096 - $0.4383
- **Examples:** WebMD, Healthline, Mayo Clinic, UnitedHealthcare, 23andMe, Ancestry

## Revenue Split

All payouts follow a consistent split model:
- **80%** → User wallet (your earnings)
- **15%** → Infrastructure costs
- **5%** → Treasury (community development)

## Action Type Multipliers

Different types of actions have different values:

- **Search Queries:** 1.5x multiplier (most valuable)
- **Interaction:** 1.2x multiplier (clicks, video watches)
- **Visit:** 1.0x multiplier (standard page visit)
- **Minute:** 0.8x multiplier (time-based engagement)

## How It Works

### Chrome Extension Integration

1. **Domain Detection:** When you visit a website, the LivePay connector (Chrome extension) detects the domain
2. **Category Matching:** The domain is matched against the pricing category map
3. **Payout Calculation:** Based on the category and action type, a payout is calculated
4. **Event Recording:** The event with payout information is saved to IndexedDB
5. **Wallet Update:** Your wallet balance is immediately updated with the user share (80%)

### Transaction Ledger

Every action creates a ledger entry with:
- Timestamp
- Category (e.g., "Ad-Driven Big Tech", "Healthcare / Risk Analytics")
- Intent description (e.g., "Visited: google.com", "Query: best laptop")
- Payout amount (user share)
- Buyer/Platform name
- Transaction hash

### Wallet Balance

Your wallet balance is persistently stored in IndexedDB and updated in real-time:
- **Balance:** Your total accumulated user share
- **Infra Total:** Total infrastructure costs allocated
- **Treasury Total:** Total community treasury contributions

## Implementation Files

### Core Files

1. **constants/PricingScheme.ts**
   - TypeScript definitions for pricing categories
   - Domain-to-category mapping
   - Payout calculation functions

2. **chrome-extension-livepay/domain-classifier.js**
   - JavaScript version for Chrome extension
   - Real-time domain classification
   - Payout calculation in service worker

3. **chrome-extension-livepay/background.js**
   - Enhanced with pricing logic
   - Automatic payout calculation on events
   - Wallet balance updates in IndexedDB

4. **constants/BrowserStorage.ts**
   - Wallet balance storage functions
   - IndexedDB wallet store management
   - Balance retrieval and updates

5. **constants/LivePayMock.ts**
   - Enhanced event processing with payout info
   - Ledger entries with category names
   - Integration with pricing scheme

## Testing the Feature

### Method 1: Use the Chrome Extension

1. Load the LivePay Chrome extension
2. Visit different websites (Google, YouTube, Amazon, ChatGPT, etc.)
3. Watch your wallet balance update in real-time
4. Check the ledger to see categorized transactions

### Method 2: Developer Console

Open your browser's Developer Console and run:

```javascript
// Check current wallet balance
const dbRequest = indexedDB.open('livepay-events', 1);
dbRequest.onsuccess = (event) => {
  const db = event.target.result;
  const transaction = db.transaction(['wallet'], 'readonly');
  const store = transaction.objectStore('wallet');
  const request = store.get('balance');
  request.onsuccess = () => {
    console.log('Wallet Balance:', request.result);
  };
};
```

### Method 3: View Events with Payouts

```javascript
// View recent events with payout information
const dbRequest = indexedDB.open('livepay-events', 1);
dbRequest.onsuccess = (event) => {
  const db = event.target.result;
  const transaction = db.transaction(['events'], 'readonly');
  const store = transaction.objectStore('events');
  const request = store.getAll();
  request.onsuccess = () => {
    const events = request.result.slice(-10); // Last 10 events
    events.forEach(e => {
      if (e.payout) {
        console.log(`${e.type} on ${e.domain}: $${e.payout.userShare} (${e.payout.categoryName})`);
      }
    });
  };
};
```

## Adding New Domains

To add support for additional domains:

1. Open `constants/PricingScheme.ts` (or `chrome-extension-livepay/domain-classifier.js` for the extension)
2. Add the domain to the `domainCategoryMap` object:

```typescript
'newdomain.com': 'category-id',
```

3. Make sure the category ID matches one of the existing pricing categories

## Future Enhancements

Potential improvements to the pricing scheme:

- [ ] Dynamic pricing based on real-time market data
- [ ] User-specific pricing tiers based on engagement quality
- [ ] Blockchain-based transaction verification
- [ ] Export ledger to CSV/JSON
- [ ] Visual analytics dashboard for earnings by category
- [ ] API for third-party platform integrations

## Reference Table

| Domain / Buyer | Annual Value | User Share (80%) | Infra (15%) | Treasury (5%) |
|----------------|--------------|------------------|-------------|---------------|
| Ad-Driven Big Tech | $250 – $600 | $200 – $480 | $38 – $90 | $12 – $30 |
| AI Subscription | $800 – $2,500 | $640 – $2,000 | $120 – $375 | $40 – $125 |
| Enterprise AI | $1,000 – $5,000 | $800 – $4,000 | $150 – $750 | $50 – $250 |
| Data Brokers | $5 – $20 | $4 – $16 | $1 – $3 | <$1 |
| People-Search | $10 – $50 | $8 – $40 | $2 – $8 | $1 – $3 |
| Loyalty/Financial | $200 – $800 | $160 – $640 | $30 – $120 | $10 – $40 |
| Healthcare | $500 – $2,000 | $400 – $1,600 | $75 – $300 | $25 – $100 |

---

**Note:** This pricing scheme is based on industry research and estimated data valuations as of 2026. Actual payouts may vary based on market conditions and platform-specific agreements.
