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

export type LivePayState = {
  walletSnapshot: WalletSnapshot;
  activityBreakdown: ActivityCategory[];
  ledger: LedgerEntry[];
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
    id: 'identifiers',
    title: 'Identifiers',
    subtitle: 'Full name, addresses, phone, email, SSN',
    amountUsd: 0,
  },
  {
    id: 'demographics',
    title: 'Demographics',
    subtitle: 'Age, gender, education, occupation, income',
    amountUsd: 0,
  },
  {
    id: 'online-activity',
    title: 'Online Activity',
    subtitle: 'Browsing, search, social interactions, content engagement',
    amountUsd: 0,
  },
  {
    id: 'commercial-financial',
    title: 'Commercial & Financial',
    subtitle: 'Purchases, brand preferences, payments, credit, property',
    amountUsd: 0,
  },
  {
    id: 'physical-movement',
    title: 'Physical Movement',
    subtitle: 'GPS location, routines, frequent places (mobile/IoT)',
    amountUsd: 0,
  },
  {
    id: 'sensitive-inferred',
    title: 'Sensitive & Inferred Data',
    subtitle: 'Health, politics, religion, inferred preferences',
    amountUsd: 0,
  },
  {
    id: 'emerging-2026',
    title: 'Emerging 2026 Categories',
    subtitle: 'Biometric, neural data, and training AI disclosures',
    amountUsd: 0,
  },
];

type ActivitySignals = {
  searchQueries: number;
  watchMinutes: number;
  videosWatched: number;
  socialVisits: number;
  socialMinutes: number;
  sitesVisited: number;
  uniqueDomains: number;
  areaExplorationScore: number;
  commerceIntents: number;
  socialEvents: number;
  topIntentLabel: string;
  topAreaLabel: string;
  youtube: {
    illmedicine: { viewHours: number; liveSubscribers: number };
    illmedicineai: { viewHours: number; liveSubscribers: number };
  };
};

export type LivePayActivityEvent =
  | { source?: string; type: 'visit'; domain?: string; url?: string }
  | { source?: string; type: 'search'; provider?: string; query: string; domain?: string; url?: string }
  | { source?: string; type: 'social_visit'; platform?: string; domain?: string; url?: string }
  | { source?: string; type: 'social_minute'; platform?: string; minutes?: number; mediaPlaying?: boolean; domain?: string; url?: string }
  | { source?: string; type: 'youtube_watch'; videoId?: string; domain?: string; url?: string }
  | { source?: string; type: 'youtube_watch_minute'; minutes?: number; domain?: string; url?: string }
  | { source?: string; type: 'youtube_channel'; handle: string; domain?: string; url?: string }
  | {
      source?: string;
      type: 'youtube_oauth_stats';
      handle: string;
      subscriberCount?: number;
      viewHours?: number;
    };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function createEmptySignals(): ActivitySignals {
  return {
    searchQueries: 0,
    watchMinutes: 0,
    videosWatched: 0,
    socialVisits: 0,
    socialMinutes: 0,
    sitesVisited: 0,
    uniqueDomains: 0,
    areaExplorationScore: 0,
    commerceIntents: 0,
    socialEvents: 0,
    topIntentLabel: 'Mixed',
    topAreaLabel: 'Mixed',
    youtube: {
      illmedicine: { viewHours: 0, liveSubscribers: 0 },
      illmedicineai: { viewHours: 0, liveSubscribers: 0 },
    },
  };
}

function generateMockSignals(previous?: ActivitySignals): ActivitySignals {
  const intentPool = ['EVs', 'AI Tools', 'Music', 'Health', 'Finance', 'Travel', 'Gaming'];
  const topIntentLabel = intentPool[Math.floor(Math.random() * intentPool.length)];
  const areaPool = ['Shopping', 'Social', 'News', 'Finance', 'Learning', 'Developer', 'Entertainment'];
  const topAreaLabel = areaPool[Math.floor(Math.random() * areaPool.length)];

  const next: ActivitySignals = {
    searchQueries: clamp((previous?.searchQueries ?? 0) + Math.floor(Math.random() * 5), 0, 2000),
    watchMinutes: clamp((previous?.watchMinutes ?? 0) + Math.floor(Math.random() * 12), 0, 24 * 60),
    videosWatched: clamp((previous?.videosWatched ?? 0) + (Math.random() < 0.25 ? 1 : 0), 0, 5000),
    socialVisits: clamp((previous?.socialVisits ?? 0) + (Math.random() < 0.25 ? 1 : 0), 0, 5000),
    socialMinutes: clamp((previous?.socialMinutes ?? 0) + Math.floor(Math.random() * 6), 0, 24 * 60),
    sitesVisited: clamp((previous?.sitesVisited ?? 0) + 1 + Math.floor(Math.random() * 3), 0, 10000),
    uniqueDomains: clamp((previous?.uniqueDomains ?? 0) + (Math.random() < 0.4 ? 1 : 0), 0, 5000),
    areaExplorationScore: clamp((previous?.areaExplorationScore ?? 0) + (Math.random() < 0.55 ? 1 : 0), 0, 50000),
    commerceIntents: clamp((previous?.commerceIntents ?? 0) + Math.floor(Math.random() * 3), 0, 5000),
    socialEvents: clamp((previous?.socialEvents ?? 0) + Math.floor(Math.random() * 4), 0, 5000),
    topIntentLabel,
    topAreaLabel,
    youtube: {
      illmedicine: {
        viewHours: clamp(round2((previous?.youtube.illmedicine.viewHours ?? 0) + Math.random() * 0.35), 0, 24),
        liveSubscribers: clamp((previous?.youtube.illmedicine.liveSubscribers ?? 0) + (Math.random() < 0.25 ? 1 : 0), 0, 10_000_000),
      },
      illmedicineai: {
        viewHours: clamp(round2((previous?.youtube.illmedicineai.viewHours ?? 0) + Math.random() * 0.25), 0, 24),
        liveSubscribers: clamp((previous?.youtube.illmedicineai.liveSubscribers ?? 0) + (Math.random() < 0.2 ? 1 : 0), 0, 10_000_000),
      },
    },
  };

  return next;
}

function diffSignals(previous: ActivitySignals, next: ActivitySignals): ActivitySignals {
  return {
    searchQueries: Math.max(0, next.searchQueries - previous.searchQueries),
    watchMinutes: Math.max(0, next.watchMinutes - previous.watchMinutes),
    videosWatched: Math.max(0, next.videosWatched - previous.videosWatched),
    socialVisits: Math.max(0, next.socialVisits - previous.socialVisits),
    socialMinutes: Math.max(0, next.socialMinutes - previous.socialMinutes),
    sitesVisited: Math.max(0, next.sitesVisited - previous.sitesVisited),
    uniqueDomains: Math.max(0, next.uniqueDomains - previous.uniqueDomains),
    areaExplorationScore: Math.max(0, next.areaExplorationScore - previous.areaExplorationScore),
    commerceIntents: Math.max(0, next.commerceIntents - previous.commerceIntents),
    socialEvents: Math.max(0, next.socialEvents - previous.socialEvents),
    topIntentLabel: next.topIntentLabel,
    topAreaLabel: next.topAreaLabel,
    youtube: {
      illmedicine: {
        viewHours: Math.max(0, next.youtube.illmedicine.viewHours - previous.youtube.illmedicine.viewHours),
        liveSubscribers: Math.max(0, next.youtube.illmedicine.liveSubscribers - previous.youtube.illmedicine.liveSubscribers),
      },
      illmedicineai: {
        viewHours: Math.max(0, next.youtube.illmedicineai.viewHours - previous.youtube.illmedicineai.viewHours),
        liveSubscribers: Math.max(0, next.youtube.illmedicineai.liveSubscribers - previous.youtube.illmedicineai.liveSubscribers),
      },
    },
  };
}

function computeEarningsDeltaUsd(delta: ActivitySignals) {
  const sitesUsd = delta.sitesVisited * 0.0005;
  const queriesUsd = delta.searchQueries * 0.003;
  const domainsUsd = delta.uniqueDomains * 0.0005;
  const areasUsd = delta.areaExplorationScore * 0.0002;

  const commerceUsd = delta.commerceIntents * 0.02;

  const videosUsd = delta.videosWatched * 0.002;
  const minutesUsd = delta.watchMinutes * 0.0005;

  const socialVisitsUsd = delta.socialVisits * 0.001;
  const socialMinutesUsd = delta.socialMinutes * 0.0008;

  return round2(sitesUsd + queriesUsd + domainsUsd + areasUsd + commerceUsd + videosUsd + minutesUsd + socialVisitsUsd + socialMinutesUsd);
}

function computeActivityBreakdown(signals: ActivitySignals): ActivityCategory[] {
  const ytLabel = `Videos: ${signals.videosWatched}, Watch: ${signals.watchMinutes} min • Views: ${round2(signals.youtube.illmedicine.viewHours + signals.youtube.illmedicineai.viewHours)}h`;

  const onlineUsdRaw = round2(
    signals.sitesVisited * 0.0005 +
      signals.searchQueries * 0.003 +
      signals.uniqueDomains * 0.0005 +
      signals.areaExplorationScore * 0.0002 +
      signals.socialVisits * 0.001 +
      signals.socialMinutes * 0.0008 +
      signals.videosWatched * 0.002 +
      signals.watchMinutes * 0.0005,
  );

  const commercialUsd = round2(signals.commerceIntents * 0.02);

  const sensitiveUsd = round2(
    Math.min(
      onlineUsdRaw * (signals.topIntentLabel !== 'Mixed' ? 0.08 : 0.04) + commercialUsd * (signals.commerceIntents > 0 ? 0.25 : 0),
      onlineUsdRaw + commercialUsd,
    ),
  );

  const onlineUsd = round2(Math.max(0, onlineUsdRaw - sensitiveUsd));

  return [
    {
      id: 'identifiers',
      title: 'Identifiers',
      subtitle: 'Full name, addresses, phone, email, SSN (not collected in prototype)',
      amountUsd: 0,
    },
    {
      id: 'demographics',
      title: 'Demographics',
      subtitle: 'Age, gender, education, occupation, income (not collected in prototype)',
      amountUsd: 0,
    },
    {
      id: 'online-activity',
      title: 'Online Activity',
      subtitle: `Queries: ${signals.searchQueries} • Domains: ${signals.uniqueDomains} • Social: ${signals.socialMinutes} min • ${ytLabel}`,
      amountUsd: onlineUsd,
      tag: `Top intent: ${signals.topIntentLabel} • Top area: ${signals.topAreaLabel}`,
    },
    {
      id: 'commercial-financial',
      title: 'Commercial & Financial',
      subtitle: `Purchase intent signals: ${signals.commerceIntents}`,
      amountUsd: commercialUsd,
    },
    {
      id: 'physical-movement',
      title: 'Physical Movement',
      subtitle: 'GPS/routines/frequent locations (not collected in prototype)',
      amountUsd: 0,
    },
    {
      id: 'sensitive-inferred',
      title: 'Sensitive & Inferred Data',
      subtitle: 'Inferred preferences & sensitive segments (modeled)',
      amountUsd: sensitiveUsd,
    },
    {
      id: 'emerging-2026',
      title: 'Emerging 2026 Categories',
      subtitle: 'Biometric/neural/AI training disclosures (not collected in prototype)',
      amountUsd: 0,
    },
  ];
}

let liveSignals: ActivitySignals = generateMockSignals();
let liveLedger: LedgerEntry[] = [];
let liveState: LivePayState = { walletSnapshot, activityBreakdown, ledger: liveLedger };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

let dailyResetTimer: ReturnType<typeof setTimeout> | undefined;
let currentDayKey = new Date().toDateString();

function emit() {
  for (const l of listeners) l();
}

function scheduleDailyReset() {
  if (dailyResetTimer) {
    clearTimeout(dailyResetTimer);
    dailyResetTimer = undefined;
  }

  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const ms = Math.max(250, next.getTime() - now.getTime());
  dailyResetTimer = setTimeout(() => {
    resetForNewDay();
    scheduleDailyReset();
  }, ms);
}

function resetForNewDay() {
  currentDayKey = new Date().toDateString();
  seenDomains = new Set<string>();
  liveSignals = createEmptySignals();
  liveLedger = [];
  liveState = {
    walletSnapshot: { ...walletSnapshot, dailyEnergyUsd: 0, todaysEarningsUsd: 0, lastPayoutLabel: 'Today, 12 AM' },
    activityBreakdown: computeActivityBreakdown(liveSignals),
    ledger: liveLedger,
  };
  emit();
}

function ensureSameDay() {
  const dayKey = new Date().toDateString();
  if (dayKey !== currentDayKey) {
    resetForNewDay();
  }
}

function pushLedgerEntry(args: { category: string; intent: string; saleUsd: number; buyer?: string }) {
  if (args.saleUsd <= 0) return;

  const ts = new Date().toISOString();
  const userSplitUsd = round2(args.saleUsd * (walletSnapshot.userSplitPct / 100));
  const meshSplitUsd = round2(args.saleUsd - userSplitUsd);

  const entry: LedgerEntry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: ts,
    category: args.category,
    intent: args.intent,
    status: 'CLAIMED',
    buyer: args.buyer ?? 'Realtime Stream',
    saleUsd: round2(args.saleUsd),
    userSplitUsd,
    meshSplitUsd,
    hash: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
  };

  liveLedger = [entry, ...liveLedger].slice(0, 200);
  liveState = { ...liveState, ledger: liveLedger };
}

export function getLivePayState(): LivePayState {
  ensureSameDay();
  return liveState;
}

export function subscribeLivePayState(listener: () => void) {
  ensureSameDay();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function startLivePayMockRealtime(options?: { intervalMs?: number }) {
  if (timer) return;
  const intervalMs = options?.intervalMs ?? 1000;

  scheduleDailyReset();

  liveSignals = generateMockSignals();
  liveState = {
    walletSnapshot: { ...walletSnapshot },
    activityBreakdown: computeActivityBreakdown(liveSignals),
    ledger: liveLedger,
  };
  emit();

  timer = setInterval(() => {
    ensureSameDay();
    const previousSignals = liveSignals;
    const nextSignals = generateMockSignals(previousSignals);
    liveSignals = nextSignals;

    const deltaSignals = diffSignals(previousSignals, nextSignals);
    const nextBreakdown = computeActivityBreakdown(nextSignals);
    const deltaUsd = computeEarningsDeltaUsd(deltaSignals);

    const nextTodays = round2(liveState.walletSnapshot.todaysEarningsUsd + deltaUsd);
    liveState = {
      walletSnapshot: {
        ...liveState.walletSnapshot,
        dailyEnergyUsd: nextTodays,
        todaysEarningsUsd: nextTodays,
      },
      activityBreakdown: nextBreakdown,
      ledger: liveLedger,
    };

    pushLedgerEntry({ category: 'Daily Energy', intent: 'Realtime accrual', saleUsd: deltaUsd });
    emit();
  }, intervalMs);
}

export function stopLivePayRealtime() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

export function startLivePayEventMode() {
  stopLivePayRealtime();
  scheduleDailyReset();
  resetForNewDay();
  emit();
}

function inferTopIntentLabel(query: string) {
  const q = query.toLowerCase();
  if (q.includes('ev') || q.includes('electric')) return 'EVs';
  if (q.includes('ai') || q.includes('chatgpt') || q.includes('model')) return 'AI Tools';
  if (q.includes('music') || q.includes('beat') || q.includes('song')) return 'Music';
  if (q.includes('health') || q.includes('workout') || q.includes('fitness')) return 'Health';
  if (q.includes('finance') || q.includes('stock') || q.includes('crypto')) return 'Finance';
  if (q.includes('travel') || q.includes('flight') || q.includes('hotel')) return 'Travel';
  if (q.includes('game') || q.includes('gaming') || q.includes('pc')) return 'Gaming';
  return 'Mixed';
}

function isCommerceQuery(query: string) {
  const q = query.toLowerCase();
  if (q.includes('buy') || q.includes('price') || q.includes('sale') || q.includes('deal') || q.includes('coupon')) return true;
  if (q.includes('nike') || q.includes('ugg') || q.includes('sneaker') || q.includes('sneakers') || q.includes('boot') || q.includes('boots')) return true;
  if (q.includes('shoe') || q.includes('shoes') || q.includes('jordan') || q.includes('air max') || q.includes('airmax')) return true;
  return false;
}

type WebArea = 'Shopping' | 'Social' | 'News' | 'Finance' | 'Learning' | 'Developer' | 'Entertainment' | 'Mixed';

function areaFromDomain(domain?: string): WebArea {
  if (!domain) return 'Mixed';
  const d = domain.toLowerCase();

  if (d.includes('amazon.') || d.includes('walmart.') || d.includes('ebay.') || d.includes('shop') || d.includes('store')) return 'Shopping';
  if (d.includes('instagram.') || d.includes('facebook.') || d.includes('x.com') || d.includes('twitter.') || d.includes('tiktok.') || d.includes('reddit.')) return 'Social';
  if (d.includes('news') || d.includes('cnn.') || d.includes('bbc.') || d.includes('nytimes.') || d.includes('washingtonpost.') || d.includes('theguardian.')) return 'News';
  if (d.includes('bank') || d.includes('paypal.') || d.includes('stripe.') || d.includes('coinbase.') || d.includes('robinhood.') || d.includes('finance')) return 'Finance';
  if (d.includes('wikipedia.') || d.includes('coursera.') || d.includes('udemy.') || d.includes('khanacademy.') || d.includes('edu')) return 'Learning';
  if (d.includes('github.') || d.includes('stackoverflow.') || d.includes('npmjs.') || d.includes('developer.') || d.includes('docs.')) return 'Developer';
  if (d.includes('youtube.') || d.includes('twitch.') || d.includes('netflix.') || d.includes('spotify.') || d.includes('soundcloud.')) return 'Entertainment';

  return 'Mixed';
}

let seenDomains = new Set<string>();

export function ingestLivePayActivityEvent(event: LivePayActivityEvent) {
  ensureSameDay();

  const nextSignals: ActivitySignals = {
    ...liveSignals,
    youtube: {
      illmedicine: { ...liveSignals.youtube.illmedicine },
      illmedicineai: { ...liveSignals.youtube.illmedicineai },
    },
  };

  const deltaSignals = createEmptySignals();

  const domain = (event as { domain?: string }).domain;
  const area = areaFromDomain(domain);

  if (event.type === 'visit') {
    nextSignals.sitesVisited += 1;
    deltaSignals.sitesVisited += 1;

    if (domain && !seenDomains.has(domain)) {
      seenDomains.add(domain);
      nextSignals.uniqueDomains += 1;
      deltaSignals.uniqueDomains += 1;
    }

    if (area !== 'Mixed') {
      nextSignals.areaExplorationScore += 1;
      deltaSignals.areaExplorationScore += 1;
      nextSignals.topAreaLabel = area;
      deltaSignals.topAreaLabel = area;
    }
  }

  if (event.type === 'search') {
    nextSignals.searchQueries += 1;
    deltaSignals.searchQueries += 1;
    const label = inferTopIntentLabel(event.query);
    nextSignals.topIntentLabel = label;
    deltaSignals.topIntentLabel = label;

    if (isCommerceQuery(event.query)) {
      nextSignals.commerceIntents += 1;
      deltaSignals.commerceIntents += 1;
    }

    if (domain && !seenDomains.has(domain)) {
      seenDomains.add(domain);
      nextSignals.uniqueDomains += 1;
      deltaSignals.uniqueDomains += 1;
    }

    if (area !== 'Mixed') {
      nextSignals.areaExplorationScore += 1;
      deltaSignals.areaExplorationScore += 1;
      nextSignals.topAreaLabel = area;
      deltaSignals.topAreaLabel = area;
    }
  }

  if (event.type === 'social_visit') {
    nextSignals.socialVisits += 1;
    deltaSignals.socialVisits += 1;
  }

  if (event.type === 'social_minute') {
    const baseMinutes = typeof event.minutes === 'number' && event.minutes > 0 ? Math.floor(event.minutes) : 1;
    const effectiveMinutes = baseMinutes * (event.mediaPlaying ? 2 : 1);
    nextSignals.socialMinutes += effectiveMinutes;
    deltaSignals.socialMinutes += effectiveMinutes;
  }

  if (event.type === 'youtube_watch') {
    nextSignals.videosWatched += 1;
    deltaSignals.videosWatched += 1;

    nextSignals.watchMinutes += 1;
    deltaSignals.watchMinutes += 1;
    nextSignals.socialEvents += 1;
    deltaSignals.socialEvents += 1;

    const incHours = 1 / 60;
    nextSignals.youtube.illmedicine.viewHours = round2(nextSignals.youtube.illmedicine.viewHours + incHours);
    deltaSignals.youtube.illmedicine.viewHours = round2(deltaSignals.youtube.illmedicine.viewHours + incHours);
  }

  if (event.type === 'youtube_watch_minute') {
    const minutes = typeof event.minutes === 'number' && event.minutes > 0 ? Math.floor(event.minutes) : 1;
    nextSignals.watchMinutes += minutes;
    deltaSignals.watchMinutes += minutes;
  }

  if (event.type === 'youtube_channel') {
    const handle = event.handle.toLowerCase();
    const incSubs = 1;
    if (handle.includes('illmedicineai')) {
      nextSignals.youtube.illmedicineai.liveSubscribers += incSubs;
      deltaSignals.youtube.illmedicineai.liveSubscribers += incSubs;
    } else if (handle.includes('illmedicine')) {
      nextSignals.youtube.illmedicine.liveSubscribers += incSubs;
      deltaSignals.youtube.illmedicine.liveSubscribers += incSubs;
    }
  }

  if (event.type === 'youtube_oauth_stats') {
    const handle = event.handle.toLowerCase();
    const setSubs = typeof event.subscriberCount === 'number' ? event.subscriberCount : undefined;
    const setHours = typeof event.viewHours === 'number' ? event.viewHours : undefined;

    if (handle.includes('illmedicineai')) {
      if (typeof setSubs === 'number') {
        const prev = nextSignals.youtube.illmedicineai.liveSubscribers;
        nextSignals.youtube.illmedicineai.liveSubscribers = setSubs;
        deltaSignals.youtube.illmedicineai.liveSubscribers += Math.max(0, setSubs - prev);
      }
      if (typeof setHours === 'number') {
        const prev = nextSignals.youtube.illmedicineai.viewHours;
        nextSignals.youtube.illmedicineai.viewHours = round2(setHours);
        deltaSignals.youtube.illmedicineai.viewHours += Math.max(0, round2(setHours - prev));
      }
    } else if (handle.includes('illmedicine')) {
      if (typeof setSubs === 'number') {
        const prev = nextSignals.youtube.illmedicine.liveSubscribers;
        nextSignals.youtube.illmedicine.liveSubscribers = setSubs;
        deltaSignals.youtube.illmedicine.liveSubscribers += Math.max(0, setSubs - prev);
      }
      if (typeof setHours === 'number') {
        const prev = nextSignals.youtube.illmedicine.viewHours;
        nextSignals.youtube.illmedicine.viewHours = round2(setHours);
        deltaSignals.youtube.illmedicine.viewHours += Math.max(0, round2(setHours - prev));
      }
    }
  }

  liveSignals = nextSignals;

  const nextBreakdown = computeActivityBreakdown(nextSignals);
  const deltaUsd = computeEarningsDeltaUsd(deltaSignals);
  const nextTodays = round2(liveState.walletSnapshot.todaysEarningsUsd + deltaUsd);
  liveState = {
    walletSnapshot: {
      ...liveState.walletSnapshot,
      dailyEnergyUsd: nextTodays,
      todaysEarningsUsd: nextTodays,
    },
    activityBreakdown: nextBreakdown,
    ledger: liveLedger,
  };

  if (event.type === 'search') {
    pushLedgerEntry({ category: 'Browsing & Search', intent: `Query: ${event.query}`, saleUsd: computeEarningsDeltaUsd({ ...createEmptySignals(), searchQueries: 1 }) });
    if (isCommerceQuery(event.query)) {
      pushLedgerEntry({ category: 'E-Commerce Interest', intent: `Shopping search: ${event.query}`, saleUsd: computeEarningsDeltaUsd({ ...createEmptySignals(), commerceIntents: 1 }) });
    }
  }
  if (event.type === 'visit') {
    // Always create a ledger entry for website visits
    const siteLabel = domain ?? 'unknown site';
    pushLedgerEntry({ category: 'Browsing & Search', intent: `Visited: ${siteLabel}`, saleUsd: computeEarningsDeltaUsd({ ...createEmptySignals(), sitesVisited: 1 }) });
    
    if (deltaSignals.uniqueDomains > 0) {
      pushLedgerEntry({ category: 'Browsing & Search', intent: `New domain: ${domain ?? 'unknown'}`, saleUsd: computeEarningsDeltaUsd({ ...createEmptySignals(), uniqueDomains: deltaSignals.uniqueDomains }) });
    }
    if (deltaSignals.areaExplorationScore > 0) {
      pushLedgerEntry({ category: 'Browsing & Search', intent: `Area: ${area}`, saleUsd: computeEarningsDeltaUsd({ ...createEmptySignals(), areaExplorationScore: deltaSignals.areaExplorationScore }) });
    }
  }
  if (event.type === 'youtube_watch') {
    pushLedgerEntry({ category: 'Content Streaming', intent: 'Video watched', saleUsd: computeEarningsDeltaUsd({ ...createEmptySignals(), videosWatched: 1 }) });
    pushLedgerEntry({ category: 'Content Streaming', intent: 'Watch time (1 min)', saleUsd: computeEarningsDeltaUsd({ ...createEmptySignals(), watchMinutes: 1 }) });
  }
  if (event.type === 'youtube_watch_minute') {
    const minutes = typeof event.minutes === 'number' && event.minutes > 0 ? Math.floor(event.minutes) : 1;
    pushLedgerEntry({ category: 'Content Streaming', intent: `Watch time (${minutes} min)`, saleUsd: computeEarningsDeltaUsd({ ...createEmptySignals(), watchMinutes: minutes }) });
  }
  if (event.type === 'youtube_oauth_stats') {
    pushLedgerEntry({ category: 'Social Media', intent: `YouTube stats update: ${event.handle}`, saleUsd: deltaUsd, buyer: 'Google OAuth' });
  }

  if (event.type === 'social_visit') {
    const label = event.platform ? event.platform : domain ? domain : 'social';
    pushLedgerEntry({ category: 'Social Media', intent: `Visit: ${label}`, saleUsd: computeEarningsDeltaUsd({ ...createEmptySignals(), socialVisits: 1 }) });
  }

  if (event.type === 'social_minute') {
    const baseMinutes = typeof event.minutes === 'number' && event.minutes > 0 ? Math.floor(event.minutes) : 1;
    const effectiveMinutes = baseMinutes * (event.mediaPlaying ? 2 : 1);
    const label = event.platform ? event.platform : domain ? domain : 'social';
    const intent = event.mediaPlaying ? `Time on ${label} (${effectiveMinutes} min, media)` : `Time on ${label} (${effectiveMinutes} min)`;
    pushLedgerEntry({ category: 'Social Media', intent, saleUsd: computeEarningsDeltaUsd({ ...createEmptySignals(), socialMinutes: effectiveMinutes }) });
  }

  emit();
}

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
