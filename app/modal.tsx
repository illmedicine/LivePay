import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.title, { color: c.text }]}>How LivePay works</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <Text style={[styles.body, { color: 'rgba(245,247,255,0.75)' }]}>LivePay is a prototype of a real-time marketplace for digital intent signals.</Text>

      <Text style={[styles.sectionTitle, { color: c.text }]}>Real-time valuation</Text>
      <Text style={[styles.body, { color: 'rgba(245,247,255,0.75)' }]}>Signals are priced dynamically using recent market benchmarks and live advertising demand.</Text>

      <Text style={[styles.sectionTitle, { color: c.text }]}>Instant split settlement (85/15)</Text>
      <Text style={[styles.body, { color: 'rgba(245,247,255,0.75)' }]}>Your wallet receives an immediate estimated payout, while a portion supports community operations and verification.</Text>

      <Text style={[styles.sectionTitle, { color: c.text }]}>Transparent ledger</Text>
      <Text style={[styles.body, { color: 'rgba(245,247,255,0.75)' }]}>Transactions are recorded so signals can be marked claimed, and resales can trigger a royalty back to you.</Text>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 14,
    height: 1,
    width: '100%',
  },
  sectionTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '800',
  },
  body: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
