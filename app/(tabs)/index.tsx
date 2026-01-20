import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { activityBreakdown, walletSnapshot } from '@/constants/LivePayMock';

function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default function WalletScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

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
  }, []);

  return (
    <ScrollView style={[styles.screen, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
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
});
