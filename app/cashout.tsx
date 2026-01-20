import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { walletSnapshot } from '@/constants/LivePayMock';

function formatUsd(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export default function CashOutScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  const available = walletSnapshot.todaysEarningsUsd;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: '#111b2e', borderColor: 'rgba(57,255,136,0.22)' }]}
      >
        <Text style={[styles.heroLabel, { color: 'rgba(245,247,255,0.7)' }]}>Available to cash out</Text>
        <Text style={[styles.heroAmount, { color: c.text }]}>{formatUsd(available)} USD</Text>
        <View style={styles.heroRow}>
          <FontAwesome name="university" size={16} color="rgba(245,247,255,0.75)" />
          <Text style={[styles.heroRowText, { color: 'rgba(245,247,255,0.75)' }]}>{walletSnapshot.linkedBankLabel}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: '#121e33', borderColor: 'rgba(255,255,255,0.06)' }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Settlement</Text>
        <Text style={[styles.cardSub, { color: 'rgba(245,247,255,0.7)' }]}>
          In this prototype, cash out is simulated. In production, payouts can be instant depending on your bank/wallet.
        </Text>

        <View style={styles.line}>
          <Text style={[styles.lineLabel, { color: 'rgba(245,247,255,0.55)' }]}>Amount</Text>
          <Text style={[styles.lineValue, { color: c.text }]}>{formatUsd(available)}</Text>
        </View>

        <View style={styles.line}>
          <Text style={[styles.lineLabel, { color: 'rgba(245,247,255,0.55)' }]}>Destination</Text>
          <Text style={[styles.lineValue, { color: c.text }]}>{walletSnapshot.linkedBankLabel}</Text>
        </View>
      </View>

      <Pressable
        style={[styles.cta, { backgroundColor: '#39ff88' }]}
        android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
        onPress={() => router.back()}>
        <Text style={[styles.ctaText, { color: '#0b1220' }]}>Confirm Cash Out</Text>
      </Pressable>

      <Pressable style={[styles.secondary, { borderColor: 'rgba(255,255,255,0.10)' }]} onPress={() => router.back()}>
        <Text style={[styles.secondaryText, { color: 'rgba(245,247,255,0.75)' }]}>Cancel</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  hero: { borderRadius: 18, padding: 16, borderWidth: 1 },
  heroLabel: { fontSize: 13, fontWeight: '700' },
  heroAmount: { marginTop: 6, fontSize: 28, fontWeight: '900' },
  heroRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroRowText: { fontSize: 13, fontWeight: '700' },
  card: { marginTop: 14, borderRadius: 14, padding: 14, borderWidth: 1 },
  cardTitle: { fontSize: 14, fontWeight: '900' },
  cardSub: { marginTop: 6, fontSize: 12, fontWeight: '500', lineHeight: 16 },
  line: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  lineLabel: { fontSize: 12, fontWeight: '700' },
  lineValue: { fontSize: 12, fontWeight: '800', textAlign: 'right', flex: 1 },
  cta: { marginTop: 16, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  secondary: { marginTop: 10, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
  secondaryText: { fontSize: 14, fontWeight: '800' },
});
