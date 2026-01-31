# LivePay Pricing Scheme - Quick Start Guide

## What's New?

LivePay now automatically calculates your earnings based on the **actual value** that different websites and platforms extract from your data and attention. Instead of arbitrary payouts, you now receive fair compensation based on industry-standard valuations.

## How Much Can I Earn?

### High-Value Platforms (per action)
- 🏥 **Healthcare Sites** (WebMD, 23andMe): **$0.11 - $0.44** per visit
- 🏢 **Enterprise AI** (Salesforce, Notion): **$0.07 - $0.37** per interaction
- 🤖 **AI Platforms** (ChatGPT, Claude): **$0.04 - $0.11** per query

### Medium-Value Platforms (per action)
- 💰 **Financial Sites** (PayPal, CreditKarma): **$0.02 - $0.09** per visit
- 🔍 **Search & Social** (Google, YouTube, Facebook): **$0.006 - $0.013** per search/visit

### Basic Platforms (per action)
- 🛒 **Shopping Sites** (Amazon, eBay): **$0.0001 - $0.0007** per visit
- 📊 **Data Brokers**: **$0.0001 - $0.0004** per data point

## Real-World Examples

### Example Daily Earnings

**Scenario 1: Light User**
- 20 Google searches: 20 × $0.009 = **$0.18**
- 5 YouTube videos: 5 × $0.010 = **$0.05**
- 3 social media visits: 3 × $0.008 = **$0.024**
- **Daily Total: ~$0.25**
- **Monthly Total: ~$7.50**

**Scenario 2: Moderate User**
- 50 Google searches: 50 × $0.009 = **$0.45**
- 15 YouTube videos: 15 × $0.010 = **$0.15**
- 10 social media visits: 10 × $0.008 = **$0.08**
- 5 ChatGPT queries: 5 × $0.075 = **$0.375**
- 3 health searches: 3 × $0.25 = **$0.75**
- **Daily Total: ~$1.80**
- **Monthly Total: ~$54**

**Scenario 3: Heavy User** (professional/researcher)
- 100 Google searches: 100 × $0.009 = **$0.90**
- 20 AI platform queries: 20 × $0.075 = **$1.50**
- 30 YouTube videos: 30 × $0.010 = **$0.30**
- 15 social media visits: 15 × $0.008 = **$0.12**
- 10 financial platform visits: 10 × $0.055 = **$0.55**
- 5 healthcare searches: 5 × $0.25 = **$1.25**
- 5 enterprise tool uses: 5 × $0.20 = **$1.00**
- **Daily Total: ~$5.62**
- **Monthly Total: ~$169**
- **Annual Total: ~$2,050**

## Where Does This Money Come From?

These valuations are based on:

1. **Actual Market Data:** What companies pay for your data
2. **Industry Reports:** Published valuations from data brokers and advertising platforms
3. **SEC Filings:** Revenue-per-user metrics from public companies
4. **Research Studies:** Academic and industry research on data valuation

For example:
- Google generates ~$350-400 per user annually from ads
- Meta (Facebook/Instagram) generates ~$250-300 per user annually
- Healthcare data can be worth $500-2,000 per person
- AI training data is highly valuable at $800-2,500 per person

## Supported Platforms

### Currently Tracked (60+ domains)

**Search & Social Media:**
- Google, Bing, Yahoo
- YouTube, Facebook, Instagram, Twitter/X, TikTok
- Reddit, LinkedIn, Pinterest, Snapchat

**AI Platforms:**
- ChatGPT (OpenAI), Claude (Anthropic)
- Midjourney, Microsoft Copilot
- Google Gemini, Character.ai, Jasper, Copy.ai

**Enterprise Tools:**
- Salesforce, ServiceNow, Workday
- Monday.com, Asana, Slack, Notion
- Oracle, SAP, Airtable

**Financial:**
- PayPal, Venmo, CashApp
- Chase, Bank of America, Wells Fargo, Citi
- Robinhood, Coinbase, CreditKarma

**Healthcare:**
- WebMD, Healthline, Mayo Clinic
- UnitedHealthcare, Anthem, Cigna
- 23andMe, Ancestry

**Shopping:**
- Amazon, Walmart, Target
- eBay, Etsy, Shopify

## How to Use

### 1. Install LivePay Chrome Extension

Load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension-livepay` folder

### 2. Browse Normally

Just use the internet as you normally would! LivePay automatically:
- ✅ Detects which site you're on
- ✅ Calculates fair payout based on the pricing table
- ✅ Updates your wallet balance instantly
- ✅ Creates transaction ledger entries

### 3. View Your Earnings

Open the LivePay app to see:
- **Real-time wallet balance**
- **Transaction history** with category breakdowns
- **Earnings by platform type**

## Understanding Your Ledger

Each transaction shows:
- **Category:** The type of platform (e.g., "Ad-Driven Big Tech", "AI Subscription")
- **Intent:** What you did (e.g., "Query: best laptop", "Visited: youtube.com")
- **Amount:** Your 80% share of the transaction
- **Buyer:** The platform category that values this data

Example ledger entry:
```
Category: AI Subscription Platforms
Intent: Query: write a Python function
Amount: $0.0750 USD
Buyer: AI Subscription Platforms
```

## Privacy & Transparency

LivePay is designed with privacy first:

- ✅ **No data leaves your browser** without your permission
- ✅ **All calculations happen locally** in the Chrome extension
- ✅ **Your browsing history is never uploaded** to any server
- ✅ **IndexedDB storage is browser-local** and encrypted
- ✅ **Open source** - you can audit the code

## Fair Compensation Model

### Revenue Split (per transaction)
- **80% to You** - Your wallet balance
- **15% to Infrastructure** - Covers costs
- **5% to Treasury** - Community development

This split ensures:
1. Users get the majority of value
2. System remains sustainable
3. Community can grow and improve

## Next Steps

1. **Install the Chrome extension** to start earning
2. **Check your wallet** regularly to see growth
3. **View the transaction ledger** to understand your data value
4. **Share feedback** to help improve the pricing model

## Questions?

**Q: Is this real money?**
A: LivePay tracks the fair market value of your data. The current prototype demonstrates how much you should be earning. Future versions will integrate with payment systems.

**Q: Why do healthcare sites pay so much?**
A: Healthcare and medical data is among the most valuable because it's used for research, insurance pricing, and pharmaceutical development.

**Q: Can I add more websites?**
A: Yes! Edit the domain mapping in `constants/PricingScheme.ts` or submit a pull request with new domains.

**Q: How accurate are these valuations?**
A: They're based on industry research and public company data. Actual values may vary, but these are conservative estimates of what your data is worth.

---

**Start earning fair compensation for your data today!**
