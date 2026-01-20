export type ActivityCategory = {
  id: string;
  title: string;
  subtitle: string;
  amountUsd: number;
  tag?: string;
};

export type LedgerEntry = {
  id: string;
  timestamp: string;
  category: string;
  intent: string;
  status: 'CLAIMED' | 'PENDING';
  buyer: string;
  saleUsd: number;
  userSplitUsd: number;
  meshSplitUsd: number;
  resaleRoyaltyUsd?: number;
  hash: string;
};

export type WalletSnapshot = {
  dailyEnergyUsd: number;
  todaysEarningsUsd: number;
  lastPayoutLabel: string;
  userSplitPct: number;
  meshSplitPct: number;
  linkedBankLabel: string;
  meshLabel: string;
};

export const walletSnapshot: WalletSnapshot = {
  dailyEnergyUsd: 7.42,
  todaysEarningsUsd: 7.42,
  lastPayoutLabel: 'Yesterday, 3 PM',
  userSplitPct: 85,
  meshSplitPct: 15,
  linkedBankLabel: 'Linked Bank',
  meshLabel: 'Community Treasury & Ops',
};

export const activityBreakdown: ActivityCategory[] = [
  {
    id: 'browse-search',
    title: 'Browsing & Search',
    subtitle: 'High intent signals',
    amountUsd: 3.15,
    tag: 'High Intent: EVs',
  },
  {
    id: 'social',
    title: 'Social Media',
    subtitle: 'Engagement: 12 posts',
    amountUsd: 1.88,
  },
  {
    id: 'commerce',
    title: 'E-Commerce Interest',
    subtitle: 'Product research',
    amountUsd: 0.9,
  },
  {
    id: 'streaming',
    title: 'Content Streaming',
    subtitle: 'Watch time signals',
    amountUsd: 0.29,
  },
];

export const ledger: LedgerEntry[] = [
  {
    id: 'l1',
    timestamp: '2026-01-18T15:02:10Z',
    category: 'Browsing & Search',
    intent: 'Best electric truck',
    status: 'CLAIMED',
    buyer: 'Ad Exchange — North America',
    saleUsd: 4.5,
    userSplitUsd: 3.83,
    meshSplitUsd: 0.67,
    resaleRoyaltyUsd: 0.12,
    hash: '0x8f3a…b21c',
  },
  {
    id: 'l2',
    timestamp: '2026-01-18T14:21:33Z',
    category: 'Social Media',
    intent: 'Fitness engagement',
    status: 'CLAIMED',
    buyer: 'Brand Network — Lifestyle',
    saleUsd: 1.4,
    userSplitUsd: 1.19,
    meshSplitUsd: 0.21,
    hash: '0x2ac1…44d0',
  },
  {
    id: 'l3',
    timestamp: '2026-01-18T13:45:08Z',
    category: 'Browsing & Search',
    intent: 'Weather',
    status: 'CLAIMED',
    buyer: 'Ad Exchange — Global',
    saleUsd: 0.05,
    userSplitUsd: 0.04,
    meshSplitUsd: 0.01,
    hash: '0x9d10…7f3e',
  },
];
