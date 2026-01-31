/**
 * LivePay Pricing Scheme
 * Defines payout structures for different domain categories
 * Based on the value created per person annually
 */

export type PricingCategory = {
  id: string;
  name: string;
  annualValueMin: number;
  annualValueMax: number;
  userShareMin: number;  // 80% of annual value
  userShareMax: number;
  infraMin: number;      // 15% of annual value
  infraMax: number;
  treasuryMin: number;   // 5% of annual value
  treasuryMax: number;
  // Per-action payout (calculated as daily average divided by estimated actions per day)
  perActionPayoutMin: number;
  perActionPayoutMax: number;
};

// Calculate per-action payout based on annual value
// Assumes ~365 days/year and variable actions per day depending on category
function calculatePerActionPayout(annualValue: number, actionsPerDay: number): number {
  return (annualValue * 0.80) / 365 / actionsPerDay; // 80% goes to user
}

export const pricingCategories: PricingCategory[] = [
  {
    id: 'ad-driven-big-tech',
    name: 'Ad-Driven Big Tech (Search, Social, Video)',
    annualValueMin: 250,
    annualValueMax: 600,
    userShareMin: 200,
    userShareMax: 480,
    infraMin: 38,
    infraMax: 90,
    treasuryMin: 12,
    treasuryMax: 30,
    perActionPayoutMin: calculatePerActionPayout(250, 100), // ~100 searches/social interactions per day
    perActionPayoutMax: calculatePerActionPayout(600, 100),
  },
  {
    id: 'ai-subscription',
    name: 'AI Subscription Platforms (LLMs, copilots, creative AI)',
    annualValueMin: 800,
    annualValueMax: 2500,
    userShareMin: 640,
    userShareMax: 2000,
    infraMin: 120,
    infraMax: 375,
    treasuryMin: 40,
    treasuryMax: 125,
    perActionPayoutMin: calculatePerActionPayout(800, 50), // ~50 AI queries per day
    perActionPayoutMax: calculatePerActionPayout(2500, 50),
  },
  {
    id: 'enterprise-ai',
    name: 'Enterprise AI / Automation',
    annualValueMin: 1000,
    annualValueMax: 5000,
    userShareMin: 800,
    userShareMax: 4000,
    infraMin: 150,
    infraMax: 750,
    treasuryMin: 50,
    treasuryMax: 250,
    perActionPayoutMin: calculatePerActionPayout(1000, 30), // ~30 enterprise actions per day
    perActionPayoutMax: calculatePerActionPayout(5000, 30),
  },
  {
    id: 'data-brokers',
    name: 'Data Brokers / Aggregators',
    annualValueMin: 5,
    annualValueMax: 20,
    userShareMin: 4,
    userShareMax: 16,
    infraMin: 1,
    infraMax: 3,
    treasuryMin: 0.25,
    treasuryMax: 1,
    perActionPayoutMin: calculatePerActionPayout(5, 200), // ~200 data points per day
    perActionPayoutMax: calculatePerActionPayout(20, 200),
  },
  {
    id: 'people-search',
    name: 'People-Search / Retail Data',
    annualValueMin: 10,
    annualValueMax: 50,
    userShareMin: 8,
    userShareMax: 40,
    infraMin: 2,
    infraMax: 8,
    treasuryMin: 1,
    treasuryMax: 3,
    perActionPayoutMin: calculatePerActionPayout(10, 150), // ~150 retail interactions per day
    perActionPayoutMax: calculatePerActionPayout(50, 150),
  },
  {
    id: 'loyalty-financial',
    name: 'Loyalty / Financial Platforms',
    annualValueMin: 200,
    annualValueMax: 800,
    userShareMin: 160,
    userShareMax: 640,
    infraMin: 30,
    infraMax: 120,
    treasuryMin: 10,
    treasuryMax: 40,
    perActionPayoutMin: calculatePerActionPayout(200, 20), // ~20 financial actions per day
    perActionPayoutMax: calculatePerActionPayout(800, 20),
  },
  {
    id: 'healthcare-risk',
    name: 'Healthcare / Risk Analytics',
    annualValueMin: 500,
    annualValueMax: 2000,
    userShareMin: 400,
    userShareMax: 1600,
    infraMin: 75,
    infraMax: 300,
    treasuryMin: 25,
    treasuryMax: 100,
    perActionPayoutMin: calculatePerActionPayout(500, 10), // ~10 healthcare interactions per day
    perActionPayoutMax: calculatePerActionPayout(2000, 10),
  },
];

/**
 * Domain-to-category mapping
 * Maps domains and URL patterns to pricing categories
 */
export const domainCategoryMap: Record<string, string> = {
  // Ad-Driven Big Tech
  'google.com': 'ad-driven-big-tech',
  'google.co.uk': 'ad-driven-big-tech',
  'google.ca': 'ad-driven-big-tech',
  'youtube.com': 'ad-driven-big-tech',
  'facebook.com': 'ad-driven-big-tech',
  'instagram.com': 'ad-driven-big-tech',
  'twitter.com': 'ad-driven-big-tech',
  'x.com': 'ad-driven-big-tech',
  'tiktok.com': 'ad-driven-big-tech',
  'reddit.com': 'ad-driven-big-tech',
  'snapchat.com': 'ad-driven-big-tech',
  'linkedin.com': 'ad-driven-big-tech',
  'pinterest.com': 'ad-driven-big-tech',
  'bing.com': 'ad-driven-big-tech',
  'yahoo.com': 'ad-driven-big-tech',
  
  // AI Subscription Platforms
  'openai.com': 'ai-subscription',
  'chat.openai.com': 'ai-subscription',
  'chatgpt.com': 'ai-subscription',
  'anthropic.com': 'ai-subscription',
  'claude.ai': 'ai-subscription',
  'midjourney.com': 'ai-subscription',
  'copilot.microsoft.com': 'ai-subscription',
  'bard.google.com': 'ai-subscription',
  'gemini.google.com': 'ai-subscription',
  'character.ai': 'ai-subscription',
  'jasper.ai': 'ai-subscription',
  'copy.ai': 'ai-subscription',
  'writesonic.com': 'ai-subscription',
  'runway.ml': 'ai-subscription',
  'synthesia.io': 'ai-subscription',
  
  // Enterprise AI
  'salesforce.com': 'enterprise-ai',
  'servicenow.com': 'enterprise-ai',
  'workday.com': 'enterprise-ai',
  'oracle.com': 'enterprise-ai',
  'sap.com': 'enterprise-ai',
  'monday.com': 'enterprise-ai',
  'asana.com': 'enterprise-ai',
  'slack.com': 'enterprise-ai',
  'notion.so': 'enterprise-ai',
  'airtable.com': 'enterprise-ai',
  
  // Data Brokers
  'acxiom.com': 'data-brokers',
  'experian.com': 'data-brokers',
  'equifax.com': 'data-brokers',
  'transunion.com': 'data-brokers',
  'oracle.com/data-cloud': 'data-brokers',
  'liveramp.com': 'data-brokers',
  'epsilon.com': 'data-brokers',
  'neustar.biz': 'data-brokers',
  
  // People Search / Retail
  'amazon.com': 'people-search',
  'walmart.com': 'people-search',
  'target.com': 'people-search',
  'ebay.com': 'people-search',
  'etsy.com': 'people-search',
  'shopify.com': 'people-search',
  'whitepages.com': 'people-search',
  'spokeo.com': 'people-search',
  'peoplefinder.com': 'people-search',
  'truthfinder.com': 'people-search',
  'beenverified.com': 'people-search',
  
  // Loyalty / Financial
  'paypal.com': 'loyalty-financial',
  'venmo.com': 'loyalty-financial',
  'cashapp.com': 'loyalty-financial',
  'chase.com': 'loyalty-financial',
  'bankofamerica.com': 'loyalty-financial',
  'wellsfargo.com': 'loyalty-financial',
  'citi.com': 'loyalty-financial',
  'americanexpress.com': 'loyalty-financial',
  'discover.com': 'loyalty-financial',
  'capitalone.com': 'loyalty-financial',
  'robinhood.com': 'loyalty-financial',
  'coinbase.com': 'loyalty-financial',
  'creditkarma.com': 'loyalty-financial',
  'mint.com': 'loyalty-financial',
  
  // Healthcare
  'webmd.com': 'healthcare-risk',
  'healthline.com': 'healthcare-risk',
  'mayoclinic.org': 'healthcare-risk',
  'nih.gov': 'healthcare-risk',
  'cdc.gov': 'healthcare-risk',
  'mychart.org': 'healthcare-risk',
  'unitedhealthcare.com': 'healthcare-risk',
  'anthem.com': 'healthcare-risk',
  'cigna.com': 'healthcare-risk',
  'aetna.com': 'healthcare-risk',
  'humana.com': 'healthcare-risk',
  'bluecrossma.org': 'healthcare-risk',
  '23andme.com': 'healthcare-risk',
  'ancestry.com': 'healthcare-risk',
};

/**
 * Get pricing category for a domain
 */
export function getPricingCategory(domain: string): PricingCategory | null {
  if (!domain) return null;
  
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  const categoryId = domainCategoryMap[normalizedDomain];
  
  if (!categoryId) {
    // Try partial matching for subdomains
    for (const [mappedDomain, catId] of Object.entries(domainCategoryMap)) {
      if (normalizedDomain.includes(mappedDomain) || normalizedDomain.endsWith(mappedDomain)) {
        return pricingCategories.find(cat => cat.id === catId) || null;
      }
    }
    return null;
  }
  
  return pricingCategories.find(cat => cat.id === categoryId) || null;
}

/**
 * Calculate payout for an action based on pricing category
 * Returns the user share (80%) of the calculated value
 */
export function calculatePayout(category: PricingCategory | null, actionType: 'search' | 'visit' | 'minute' | 'interaction' = 'visit'): { userShare: number; infra: number; treasury: number; total: number } {
  if (!category) {
    // Default fallback payout for unclassified domains
    return { userShare: 0.001, infra: 0.0002, treasury: 0.0001, total: 0.0013 };
  }
  
  // Use average of min/max for per-action payout
  const baseUserPayout = (category.perActionPayoutMin + category.perActionPayoutMax) / 2;
  
  // Adjust based on action type
  let multiplier = 1.0;
  switch (actionType) {
    case 'search':
      multiplier = 1.5; // Searches are more valuable
      break;
    case 'visit':
      multiplier = 1.0;
      break;
    case 'minute':
      multiplier = 0.8; // Time-based is slightly less per unit
      break;
    case 'interaction':
      multiplier = 1.2;
      break;
  }
  
  const userShare = baseUserPayout * multiplier;
  const infra = userShare * 0.1875; // 15% of total (user is 80% of total, so infra is 15/80 of user share)
  const treasury = userShare * 0.0625; // 5% of total (5/80 of user share)
  
  return {
    userShare: Math.round(userShare * 10000) / 10000,
    infra: Math.round(infra * 10000) / 10000,
    treasury: Math.round(treasury * 10000) / 10000,
    total: Math.round((userShare + infra + treasury) * 10000) / 10000,
  };
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(domain: string): string {
  const category = getPricingCategory(domain);
  return category ? category.name : 'General Web Activity';
}
