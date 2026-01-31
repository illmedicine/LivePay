import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Platform } from 'react-native';

import { watchEvents } from '@/constants/BrowserStorage';
import {
    getLivePayState,
    ingestLivePayActivityEvent,
    startLivePayEventMode,
    startLivePayMockRealtime,
    subscribeLivePayState,
    updateWalletFromIndexedDB,
} from '@/constants/LivePayMock';

function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default function WalletScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      let es: EventSource | null = null;
      let cancelled = false;
      let unwatch: (() => void) | null = null;

      (async () => {
        try {
          const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
          const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

          // First, check if Chrome extension has any data
          console.log('🔍 LivePay App: Checking for Chrome extension data...');
          
          let hasExtensionData = false;
          try {
            // Check if IndexedDB has livepay-events database with data
            const databases = await indexedDB.databases();
            const livepayDb = databases.find(db => db.name === 'livepay-events');
            
            if (livepayDb) {
              console.log('✅ LivePay App: Found Chrome extension database');
              
              // Check if it has events
              const { getEvents } = await import('@/constants/BrowserStorage');
              const events = await getEvents();
              hasExtensionData = events.length > 0;
              
              if (hasExtensionData) {
                console.log(`✅ LivePay App: Found ${events.length} events from Chrome extension`);
              } else {
                console.log('⚠️ LivePay App: Database exists but no events yet');
              }
            } else {
              console.log('ℹ️ LivePay App: No Chrome extension database found');
            }
          } catch (err) {
            console.log('ℹ️ LivePay App: Unable to check for extension data', err);
          }

          // Start in event mode and watch IndexedDB
          startLivePayEventMode();
          console.log('👀 LivePay App: Starting to watch IndexedDB for events');
          
          // Load wallet balance from IndexedDB
          await updateWalletFromIndexedDB();
          
          unwatch = await watchEvents((events) => {
            console.log('📊 LivePay App: Received', events.length, 'events from IndexedDB');
            if (events.length > 0) {
              console.log('🔄 LivePay App: Processing events from Chrome extension');
              // Process all events
              events.forEach(event => {
                if (event && typeof event === 'object') {
                  ingestLivePayActivityEvent(event);
                }
              });
              console.log('✅ LivePay App: Loaded', events.length, 'real events from extension');
              // Update wallet after processing events
              updateWalletFromIndexedDB();
              
              // Mark that we have extension data
              hasExtensionData = true;
            }
          });

          // Additionally, try to connect to local server if available
          if (isLocalhost) {
            try {
              const res = await fetch('http://localhost:4317/oauth/google/pairing-token', { 
                signal: AbortSignal.timeout(2000) 
              });
              const json = (await res.json()) as { ok?: boolean; token?: string };
              if (cancelled) return;

              const token = json && typeof json.token === 'string' ? json.token : '';
              if (token) {
                console.log('🔌 LivePay App: Connected to local server');
                hasExtensionData = true; // Server connection counts as having data
                es = new EventSource(`http://localhost:4317/events?token=${encodeURIComponent(token)}`);
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
              }
            } catch (err) {
              console.log('ℹ️ LivePay App: Local server not available');
            }
          }
          
          // Only start mock data if no extension data was found after a brief delay
          setTimeout(() => {
            if (!hasExtensionData && !cancelled) {
              console.log('ℹ️ LivePay App: No connector data found. Starting demo mode with mock data.');
              console.log('💡 Install the Chrome extension to see real earnings!');
              setIsDemoMode(true);
              startLivePayMockRealtime();
            } else if (hasExtensionData) {
              console.log('✅ LivePay App: Using real data from connector. Mock data disabled.');
              setIsDemoMode(false);
            }
          }, 1000); // Wait 1 second to ensure extension data is checked
          
        } catch (err) {
          console.error('❌ LivePay App: Error setting up event watchers', err);
          // Only fall back to mock if there's an error
          setIsDemoMode(true);
          startLivePayMockRealtime();
        }
      })();

      return () => {
        cancelled = true;
        if (es) es.close();
        if (unwatch) unwatch();
      };
    } else {
      // For non-web platforms (iOS/Android), use mock data
      setIsDemoMode(true);
      startLivePayMockRealtime();
    }
  }, []);

  const liveState = useSyncExternalStore(subscribeLivePayState, getLivePayState, getLivePayState);
  const walletSnapshot = liveState.walletSnapshot;
  const activityBreakdown = liveState.activityBreakdown;

  const dailyEnergyPoints = useMemo(() => {
    const base = walletSnapshot.dailyEnergyUsd;
    return [
      base * 0.3,
      base * 0.55,
      base * 0.25,
      base * 0.8,
      base * 0.35,
      base * 0.7,
      base * 0.45,
      base * 0.9,
      base * 0.5,
    ];
  }, [walletSnapshot.dailyEnergyUsd]);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      {isDemoMode && (
        <View style={styles.demoBanner}>
          <FontAwesome name="info-circle" size={16} color="#ffa500" style={styles.demoIcon} />
          <View style={styles.demoTextContainer}>
            <Text style={styles.demoTitle}>Demo Mode</Text>
            <Text style={styles.demoText}>Install the Chrome extension to see real earnings</Text>
          </View>
        </View>
      )}
      <View style={styles.brandRow}>
        <Image source={require('../../assets/images/illy-robotic-instruments.png')} style={styles.brandLogo} resizeMode="contain" />
        <Text style={[styles.brandTagline, { color: 'rgba(245,247,255,0.65)' }]}>LivePay — an Illy Robotic Instrument</Text>
      </View>

      <Text style={[styles.headerTitle, { color: c.text }]}>Your Wallet</Text>

      <View style={[styles.heroCard, { backgroundColor: '#111b2e', borderColor: 'rgba(57,255,136,0.22)' }]}>
        <Text style={[styles.heroLabel, { color: 'rgba(245,247,255,0.7)' }]}>Daily Energy</Text>
        <View style={styles.sparklineRow}>
          {dailyEnergyPoints.map((p, idx) => (
            <View
              key={idx}
              style={[
                styles.sparkBar,
                {
                  height: Math.max(6, Math.min(36, p * 6)),
                  backgroundColor: idx % 2 === 0 ? '#39ff88' : 'rgba(57,255,136,0.55)',
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.heroAmount, { color: c.text }]}>{formatUsd(walletSnapshot.todaysEarningsUsd)} USD</Text>
        <Text style={[styles.heroSub, { color: 'rgba(245,247,255,0.65)' }]}>Today’s earnings</Text>
        <Text style={[styles.heroFoot, { color: 'rgba(245,247,255,0.55)' }]}>Last payout: {walletSnapshot.lastPayoutLabel}</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: c.text }]}>Activity Breakdown</Text>
      <View style={styles.list}>
        {activityBreakdown.map((item) => (
          <View key={item.id} style={[styles.rowCard, { backgroundColor: '#121e33', borderColor: 'rgba(255,255,255,0.06)' }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBadge, { backgroundColor: 'rgba(57,255,136,0.12)', borderColor: 'rgba(57,255,136,0.22)' }]}>
                <FontAwesome name="bolt" size={16} color="#39ff88" />
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: c.text }]}>{item.title}</Text>
                <Text style={[styles.rowSub, { color: 'rgba(245,247,255,0.65)' }]}>{item.subtitle}</Text>
                {item.tag ? (
                  <View style={[styles.tag, { backgroundColor: 'rgba(57,255,136,0.10)', borderColor: 'rgba(57,255,136,0.25)' }]}>
                    <Text style={[styles.tagText, { color: '#39ff88' }]}>{item.tag}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Text style={[styles.rowAmount, { color: c.text }]}>{formatUsd(item.amountUsd)}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: c.text }]}>Split Mechanics</Text>
      <View style={[styles.splitCard, { backgroundColor: '#121e33', borderColor: 'rgba(255,255,255,0.06)' }]}>
        <View style={styles.splitTop}>
          <View style={styles.splitCircle}>
            <View style={[styles.splitRing, { borderColor: 'rgba(57,255,136,0.9)' }]}>
              <Text style={[styles.splitPct, { color: c.text }]}>{walletSnapshot.userSplitPct}%</Text>
              <Text style={[styles.splitLabel, { color: 'rgba(245,247,255,0.65)' }]}>Your wallet</Text>
            </View>
          </View>

          <View style={styles.splitDetails}>
            <View style={styles.splitLine}>
              <FontAwesome name="exchange" size={16} color="#39ff88" />
              <Text style={[styles.splitLineText, { color: 'rgba(245,247,255,0.75)' }]}>
                {walletSnapshot.meshSplitPct}% community reinvestment
              </Text>
            </View>
            <View style={styles.splitLine}>
              <FontAwesome name="university" size={16} color="rgba(245,247,255,0.75)" />
              <Text style={[styles.splitLineText, { color: 'rgba(245,247,255,0.75)' }]}>{walletSnapshot.linkedBankLabel}</Text>
            </View>
            <View style={styles.splitLine}>
              <FontAwesome name="globe" size={16} color="rgba(245,247,255,0.75)" />
              <Text style={[styles.splitLineText, { color: 'rgba(245,247,255,0.75)' }]}>{walletSnapshot.meshLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.cta, { backgroundColor: '#39ff88' }]}
        android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
        onPress={() => router.push('/cashout')}>
        <Text style={[styles.ctaText, { color: '#0b1220' }]}>Cash Out Now</Text>
      </Pressable>
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
  brandRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandLogo: {
    width: 140,
    height: 140,
  },
  brandTagline: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  heroCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  sparklineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingVertical: 10,
  },
  sparkBar: {
    width: 10,
    borderRadius: 5,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  heroSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  heroFoot: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  rowCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
    paddingRight: 12,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  tag: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  splitCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  splitTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  splitCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(57,255,136,0.08)',
  },
  splitPct: {
    fontSize: 20,
    fontWeight: '900',
  },
  splitLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
  },
  splitDetails: {
    flex: 1,
    gap: 10,
  },
  splitLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  splitLineText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  cta: {
    marginTop: 16,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 165, 0, 0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  demoIcon: {
    marginTop: 2,
  },
  demoTextContainer: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffa500',
    marginBottom: 2,
  },
  demoText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 165, 0, 0.9)',
  },
});
