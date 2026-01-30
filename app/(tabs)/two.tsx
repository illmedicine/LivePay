import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import {
    getLivePayState,
    ingestLivePayActivityEvent,
    startLivePayEventMode,
    startLivePayMockRealtime,
    subscribeLivePayState,
} from '@/constants/LivePayMock';

function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default function LedgerScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  useEffect(() => {
    if (Platform.OS === 'web') {
      let es: EventSource | null = null;
      let cancelled = false;

      (async () => {
        try {
          // Try to connect to event server (production or local)
          // Production: uses EXPO_PUBLIC_EVENT_SERVER_URL environment variable
          // Local: defaults to localhost:4317
          const eventServerUrl = 
            typeof process !== 'undefined' && process.env && (process.env as any).EXPO_PUBLIC_EVENT_SERVER_URL
              ? (process.env as any).EXPO_PUBLIC_EVENT_SERVER_URL
              : 'http://localhost:4317';

          const res = await fetch(`${eventServerUrl}/oauth/google/pairing-token`);
          const json = (await res.json()) as { ok?: boolean; token?: string };
          if (cancelled) return;

          const token = json && typeof json.token === 'string' ? json.token : '';
          if (!token) {
            startLivePayMockRealtime();
            return;
          }

          startLivePayEventMode();

          es = new EventSource(`${eventServerUrl}/events?token=${encodeURIComponent(token)}`);
          es.onmessage = (msg) => {
            try {
              const event = JSON.parse(msg.data);
              if (event && typeof event === 'object') {
                ingestLivePayActivityEvent(event);
              }
            } catch {
              // ignore
            }
          };
          
          es.onerror = () => {
            if (es) es.close();
            if (!cancelled) {
              startLivePayMockRealtime();
            }
          };
        } catch {
          startLivePayMockRealtime();
        }
      })();

      return () => {
        cancelled = true;
        if (es) es.close();
      };
    }

    startLivePayMockRealtime();
  }, []);

  const liveState = useSyncExternalStore(subscribeLivePayState, getLivePayState, getLivePayState);
  const ledger = liveState.ledger;
  const [displayCount, setDisplayCount] = useState(10);

  const displayedLedger = ledger.slice(0, displayCount);
  const hasMore = ledger.length > displayCount;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 10, ledger.length));
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.banner, { backgroundColor: '#121e33', borderColor: 'rgba(255,255,255,0.06)' }]}>
        <View style={styles.bannerIcon}>
          <FontAwesome name="lock" size={18} color="#39ff88" />
        </View>
        <View style={styles.bannerText}>
          <Text style={[styles.bannerTitle, { color: c.text }]}>One‑Sale Rule</Text>
          <Text style={[styles.bannerSub, { color: 'rgba(245,247,255,0.7)' }]}>
            Each data packet is marked claimed on the ledger to prevent duplicate sales.
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Transactions</Text>
      <View style={styles.list}>
        {displayedLedger.map((entry) => (
          <View key={entry.id} style={[styles.card, { backgroundColor: '#111b2e', borderColor: 'rgba(255,255,255,0.06)' }]}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <Text style={[styles.cardTitle, { color: c.text }]}>{entry.intent}</Text>
                <Text style={[styles.cardSub, { color: 'rgba(245,247,255,0.65)' }]}>{entry.category}</Text>
                {entry.source && (
                  <Text style={[styles.cardSource, { color: 'rgba(57,255,136,0.8)' }]}>Source: {entry.source}</Text>
                )}
              </View>
              <View style={[styles.badge, { backgroundColor: 'rgba(57,255,136,0.12)', borderColor: 'rgba(57,255,136,0.28)' }]}>
                <Text style={[styles.badgeText, { color: '#39ff88' }]}>{entry.status}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: 'rgba(245,247,255,0.55)' }]}>Buyer</Text>
              <Text style={[styles.metaValue, { color: c.text }]}>{entry.buyer}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: 'rgba(245,247,255,0.55)' }]}>Sale</Text>
              <Text style={[styles.metaValue, { color: c.text }]}>{formatUsd(entry.saleUsd)}</Text>
            </View>

            <View style={styles.splitRow}>
              <View style={styles.splitItem}>
                <Text style={[styles.splitLabel, { color: 'rgba(245,247,255,0.55)' }]}>Your payout</Text>
                <Text style={[styles.splitValue, { color: c.text }]}>{formatUsd(entry.userSplitUsd)}</Text>
              </View>
              <View style={styles.splitItem}>
                <Text style={[styles.splitLabel, { color: 'rgba(245,247,255,0.55)' }]}>Community</Text>
                <Text style={[styles.splitValue, { color: c.text }]}>{formatUsd(entry.meshSplitUsd)}</Text>
              </View>
              <View style={styles.splitItem}>
                <Text style={[styles.splitLabel, { color: 'rgba(245,247,255,0.55)' }]}>Royalty</Text>
                <Text style={[styles.splitValue, { color: c.text }]}>{formatUsd(entry.resaleRoyaltyUsd ?? 0)}</Text>
              </View>
            </View>

            <View style={styles.hashRow}>
              <FontAwesome name="hashtag" size={12} color="rgba(245,247,255,0.55)" />
              <Text style={[styles.hashText, { color: 'rgba(245,247,255,0.65)' }]}>{entry.hash}</Text>
            </View>
          </View>
        ))}
        {hasMore && (
          <TouchableOpacity style={[styles.loadMoreButton, { backgroundColor: '#111b2e', borderColor: 'rgba(255,255,255,0.06)' }]} onPress={loadMore}>
            <Text style={[styles.loadMoreText, { color: '#39ff88' }]}>Load More</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  banner: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  bannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(57,255,136,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(57,255,136,0.22)',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bannerSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '800',
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTopLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  cardSource: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '500',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  splitRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  splitItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  splitLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  splitValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '900',
  },
  hashRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hashText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadMoreButton: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
