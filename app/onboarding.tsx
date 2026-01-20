import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  return (
    <ScrollView style={[styles.screen, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: c.text }]}>Welcome to LivePay</Text>
      <Text style={[styles.sub, { color: 'rgba(245,247,255,0.72)' }]}>
        LivePay helps you understand the value of your digital activity and settle payouts in near real time.
      </Text>

      <View style={[styles.card, { backgroundColor: '#111b2e', borderColor: 'rgba(255,255,255,0.06)' }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Step 1: Device Link</Text>
        <Text style={[styles.cardSub, { color: 'rgba(245,247,255,0.7)' }]}>
          Connect your device so LivePay can measure high‑level usage signals. This is a placeholder flow in the prototype.
        </Text>
        <View style={styles.stepRow}>
          <FontAwesome name="mobile" size={18} color="#39ff88" />
          <Text style={[styles.stepText, { color: c.text }]}>Device link status</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(57,255,136,0.12)', borderColor: 'rgba(57,255,136,0.28)' }]}>
            <Text style={[styles.badgeText, { color: '#39ff88' }]}>Connected</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: '#121e33', borderColor: 'rgba(255,255,255,0.06)' }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Step 2: Verification</Text>
        <Text style={[styles.cardSub, { color: 'rgba(245,247,255,0.7)' }]}>
          Verified participants may qualify for higher valuation and faster settlement.
        </Text>
        <View style={styles.stepRow}>
          <FontAwesome name="shield" size={18} color="rgba(245,247,255,0.8)" />
          <Text style={[styles.stepText, { color: c.text }]}>Participant status</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(57,255,136,0.12)', borderColor: 'rgba(57,255,136,0.28)' }]}>
            <Text style={[styles.badgeText, { color: '#39ff88' }]}>Verified</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: '#121e33', borderColor: 'rgba(255,255,255,0.06)' }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Step 3: Payout Destination</Text>
        <Text style={[styles.cardSub, { color: 'rgba(245,247,255,0.7)' }]}>
          Add a bank account or wallet to receive instant settlements.
        </Text>
        <View style={styles.stepRow}>
          <FontAwesome name="university" size={18} color="rgba(245,247,255,0.8)" />
          <Text style={[styles.stepText, { color: c.text }]}>Bank account</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(57,255,136,0.12)', borderColor: 'rgba(57,255,136,0.28)' }]}>
            <Text style={[styles.badgeText, { color: '#39ff88' }]}>Linked</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.cta, { backgroundColor: '#39ff88' }]}
        android_ripple={{ color: 'rgba(0,0,0,0.2)' }}
        onPress={() => router.replace('/')}>
        <Text style={[styles.ctaText, { color: '#0b1220' }]}>Finish</Text>
      </Pressable>

      <Text style={[styles.foot, { color: 'rgba(245,247,255,0.55)' }]}>
        This onboarding is UI-only for now. Next we can connect real account linking and consent storage.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 24, fontWeight: '900' },
  sub: { marginTop: 8, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  card: { marginTop: 14, borderRadius: 14, padding: 14, borderWidth: 1 },
  cardTitle: { fontSize: 14, fontWeight: '900' },
  cardSub: { marginTop: 6, fontSize: 12, fontWeight: '500', lineHeight: 16 },
  stepRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepText: { fontSize: 13, fontWeight: '800', flex: 1 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.2 },
  cta: { marginTop: 18, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  ctaText: { fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  foot: { marginTop: 12, fontSize: 12, fontWeight: '600', lineHeight: 16 },
});
