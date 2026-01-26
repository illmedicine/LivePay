import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StatusBar } from 'expo-status-bar';
import { Image, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];

  return (
    <View style={[styles.page, { backgroundColor: '#f5f9ff' }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.brandRow}>
          <Image source={require('../assets/images/illy-robotic-instruments.png')} style={styles.brandLogo} resizeMode="contain" />
          <Text style={[styles.brandTagline, { color: 'rgba(20, 32, 55, 0.7)' }]}>LivePay — an Illy Robotic Instrument</Text>
        </View>

        <Text style={[styles.title, { color: '#0b1220' }]}>Realtime Value Pipeline</Text>

        <View style={styles.heroRow}>
          <View style={styles.illustrationCard}>
            <View style={styles.illustrationHalo} />
            <View style={styles.phone}>
              <View style={styles.phoneTop} />
              <View style={styles.phoneBody}>
                <View style={styles.phoneRow}>
                  <View style={styles.phoneDot} />
                  <View style={[styles.phoneLine, { width: 110 }]} />
                </View>
                <View style={styles.phoneRow}>
                  <View style={styles.phoneDot} />
                  <View style={[styles.phoneLine, { width: 92 }]} />
                </View>
                <View style={styles.phoneRow}>
                  <View style={styles.phoneDot} />
                  <View style={[styles.phoneLine, { width: 124 }]} />
                </View>
                <View style={styles.phoneSignals}>
                  <View style={[styles.signalPill, { backgroundColor: '#e9fff3', borderColor: 'rgba(57,255,136,0.35)' }]}>
                    <FontAwesome name="search" size={12} color="#0b7a3a" />
                    <Text style={[styles.signalText, { color: '#0b7a3a' }]}>Search</Text>
                  </View>
                  <View style={[styles.signalPill, { backgroundColor: '#eef4ff', borderColor: 'rgba(55,125,255,0.35)' }]}>
                    <FontAwesome name="instagram" size={12} color="#1f4aa8" />
                    <Text style={[styles.signalText, { color: '#1f4aa8' }]}>Social</Text>
                  </View>
                  <View style={[styles.signalPill, { backgroundColor: '#fff3e9', borderColor: 'rgba(255,140,57,0.35)' }]}>
                    <FontAwesome name="play" size={12} color="#a84a1f" />
                    <Text style={[styles.signalText, { color: '#a84a1f' }]}>Watch</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.bubbleRow}>
              <View style={[styles.bubble, { backgroundColor: '#ffffff' }]}>
                <FontAwesome name="chrome" size={14} color="#1a73e8" />
              </View>
              <View style={[styles.bubble, { backgroundColor: '#ffffff' }]}>
                <FontAwesome name="line-chart" size={14} color="#0b7a3a" />
              </View>
              <View style={[styles.bubble, { backgroundColor: '#ffffff' }]}>
                <FontAwesome name="globe" size={14} color="#1f4aa8" />
              </View>
              <View style={[styles.bubble, { backgroundColor: '#ffffff' }]}>
                <FontAwesome name="credit-card" size={14} color="#0b1220" />
              </View>
            </View>
          </View>

          <View style={styles.timeline}>
            <View style={styles.timelineLine} />

            <View style={styles.stepRow}>
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>01</Text>
              </View>
              <View style={styles.stepBody}>
                <View style={styles.stepTitleRow}>
                  <FontAwesome name="chrome" size={16} color="#0b7a3a" />
                  <Text style={styles.stepTitle}>Capture activity</Text>
                </View>
                <Text style={styles.stepText}>Chrome streams visit, search, social, and watch-time signals as you browse.</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>02</Text>
              </View>
              <View style={styles.stepBody}>
                <View style={styles.stepTitleRow}>
                  <FontAwesome name="sliders" size={16} color="#0b7a3a" />
                  <Text style={styles.stepTitle}>Normalize + count signals</Text>
                </View>
                <Text style={styles.stepText}>Signals are categorized (Browsing, Social, Streaming, Commerce) and measured (domains, minutes, videos, queries).</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>03</Text>
              </View>
              <View style={styles.stepBody}>
                <View style={styles.stepTitleRow}>
                  <FontAwesome name="line-chart" size={16} color="#0b7a3a" />
                  <Text style={styles.stepTitle}>Value it in realtime</Text>
                </View>
                <Text style={styles.stepText}>A valuation engine prices each event using payout rates and live demand benchmarks.</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>04</Text>
              </View>
              <View style={styles.stepBody}>
                <View style={styles.stepTitleRow}>
                  <FontAwesome name="globe" size={16} color="#0b7a3a" />
                  <Text style={styles.stepTitle}>Sell on Global Mesh Marketplace</Text>
                </View>
                <Text style={styles.stepText}>LivePay packages your signals into claimable ledger entries and sells them immediately on your behalf.</Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumBox}>
                <Text style={styles.stepNum}>05</Text>
              </View>
              <View style={styles.stepBody}>
                <View style={styles.stepTitleRow}>
                  <FontAwesome name="credit-card" size={16} color="#0b7a3a" />
                  <Text style={styles.stepTitle}>Get paid in realtime</Text>
                </View>
                <Text style={styles.stepText}>Your wallet updates instantly, splitting proceeds between you and the community treasury.</Text>
              </View>
            </View>
          </View>
        </View>

        <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  container: {
    padding: 22,
    paddingBottom: 34,
    alignItems: 'center',
  },
  heroRow: {
    width: '100%',
    maxWidth: 980,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 24,
    marginTop: 18,
  },
  brandRow: {
    width: '100%',
    maxWidth: 980,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandLogo: {
    width: 110,
    height: 110,
  },
  brandTagline: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
    maxWidth: 980,
  },
  illustrationCard: {
    width: '100%',
    flexBasis: 380,
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: '#eaf2ff',
    padding: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(10, 25, 55, 0.08)',
  },
  illustrationHalo: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(210, 228, 255, 0.8)',
    top: 46,
  },
  phone: {
    width: 210,
    height: 280,
    borderRadius: 26,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(10, 25, 55, 0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  phoneTop: {
    height: 18,
    backgroundColor: '#f3f6fb',
  },
  phoneBody: {
    flex: 1,
    padding: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  phoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d7e3f7',
  },
  phoneLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e6eefc',
  },
  phoneSignals: {
    marginTop: 10,
    gap: 8,
  },
  signalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '800',
  },
  bubbleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  bubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(10, 25, 55, 0.10)',
  },
  timeline: {
    width: '100%',
    flexGrow: 1,
    flexBasis: 320,
    minWidth: 0,
    maxWidth: 560,
    position: 'relative',
    paddingLeft: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 40,
    top: 18,
    bottom: 10,
    width: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(10, 25, 55, 0.14)',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 22,
  },
  stepNumBox: {
    width: 56,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d7e7ff',
    borderWidth: 1,
    borderColor: 'rgba(10, 25, 55, 0.10)',
  },
  stepNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0b1220',
  },
  stepBody: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0b1220',
  },
  stepText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    color: 'rgba(20, 32, 55, 0.78)',
  },
});
