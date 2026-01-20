import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  return (
    <ScrollView style={[styles.screen, { backgroundColor: c.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: c.text }]}>Settings</Text>

      <View style={[styles.card, { backgroundColor: '#111b2e', borderColor: 'rgba(255,255,255,0.06)' }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Verification</Text>
        <Text style={[styles.cardSub, { color: 'rgba(245,247,255,0.7)' }]}>
          Your status affects your earning rate. Complete device and identity checks to unlock premium valuation.
        </Text>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <FontAwesome name="shield" size={16} color="#39ff88" />
            <Text style={[styles.rowText, { color: c.text }]}>Verified participant</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: 'rgba(57,255,136,0.12)', borderColor: 'rgba(57,255,136,0.28)' }]}>
            <Text style={[styles.badgeText, { color: '#39ff88' }]}>Active</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <FontAwesome name="mobile" size={16} color="rgba(245,247,255,0.75)" />
            <Text style={[styles.rowText, { color: c.text }]}>Device link</Text>
          </View>
          <Pressable style={styles.linkBtn} onPress={() => router.push('/onboarding')}>
            <Text style={[styles.linkBtnText, { color: '#39ff88' }]}>Review</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <FontAwesome name="university" size={16} color="rgba(245,247,255,0.75)" />
            <Text style={[styles.rowText, { color: c.text }]}>Payout account</Text>
          </View>
          <Text style={[styles.rowMeta, { color: 'rgba(245,247,255,0.65)' }]}>Linked</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: '#121e33', borderColor: 'rgba(255,255,255,0.06)' }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Privacy Controls</Text>
        <Text style={[styles.cardSub, { color: 'rgba(245,247,255,0.7)' }]}>
          You control what’s measured and how it’s used. These options are placeholders for now.
        </Text>

        <SettingToggle label="Personalized valuation" defaultValue />
        <SettingToggle label="Marketplace matching" defaultValue />
        <SettingToggle label="Share anonymized trends" defaultValue={false} />
      </View>

      <View style={[styles.card, { backgroundColor: '#121e33', borderColor: 'rgba(255,255,255,0.06)' }]}>
        <Text style={[styles.cardTitle, { color: c.text }]}>Support</Text>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <FontAwesome name="info-circle" size={16} color="rgba(245,247,255,0.75)" />
            <Text style={[styles.rowText, { color: c.text }]}>How LivePay works</Text>
          </View>
          <Pressable style={styles.linkBtn} onPress={() => router.push('/modal')}>
            <Text style={[styles.linkBtnText, { color: '#39ff88' }]}>Open</Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.foot, { color: 'rgba(245,247,255,0.55)' }]}>LivePay • Prototype build</Text>
    </ScrollView>
  );
}

function SettingToggle({ label, defaultValue }: { label: string; defaultValue: boolean }) {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  return (
    <View style={styles.toggleRow}>
      <Text style={[styles.toggleLabel, { color: c.text }]}>{label}</Text>
      <Switch value={defaultValue} trackColor={{ false: 'rgba(255,255,255,0.2)', true: 'rgba(57,255,136,0.35)' }} thumbColor={defaultValue ? '#39ff88' : '#94a3b8'} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '900' },
  cardSub: { marginTop: 6, fontSize: 12, fontWeight: '500', lineHeight: 16 },
  row: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  rowText: { fontSize: 13, fontWeight: '700' },
  rowMeta: { fontSize: 12, fontWeight: '700' },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.2 },
  linkBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(57,255,136,0.08)', borderWidth: 1, borderColor: 'rgba(57,255,136,0.18)' },
  linkBtnText: { fontSize: 12, fontWeight: '900' },
  toggleRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  toggleLabel: { fontSize: 13, fontWeight: '700', flex: 1 },
  foot: { marginTop: 4, fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
