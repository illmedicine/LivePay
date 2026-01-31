/**
 * Domain Classification Utility for Chrome Extension
 * Determines pricing category for domains to calculate payouts
 */

const pricingCategories = [
  {
    id: 'ad-driven-big-tech',
    name: 'Ad-Driven Big Tech (Search, Social, Video)',
    perActionPayoutMin: 0.0055,
    perActionPayoutMax: 0.0131,
  },
  {
    id: 'ai-subscription',
    name: 'AI Subscription Platforms (LLMs, copilots, creative AI)',
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
function getPricingCategory(domain) {
  if (!domain) return null;
  
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  let categoryId = domainCategoryMap[normalizedDomain];
  
  if (!categoryId) {
    // Try partial matching for subdomains
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

/**
 * Calculate payout for an action based on pricing category
 * Returns breakdown: userShare (80%), infra (15%), treasury (5%)
 */
function calculatePayout(domain, actionType = 'visit') {
  const category = getPricingCategory(domain);
  
  if (!category) {
    // Default fallback payout for unclassified domains
    return { 
      userShare: 0.001, 
      infra: 0.0002, 
      treasury: 0.0001, 
      total: 0.0013,
      categoryName: 'General Web Activity'
    };
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
    categoryName: category.name,
  };
}

/**
 * Get category display name
 */
function getCategoryDisplayName(domain) {
  const category = getPricingCategory(domain);
  return category ? category.name : 'General Web Activity';
}
