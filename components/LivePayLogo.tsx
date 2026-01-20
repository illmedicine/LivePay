import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

export function LivePayLogo({ size = 18 }: { size?: number }) {
  const colorScheme = useColorScheme() ?? 'dark';
  const c = Colors[colorScheme];
  const badgeFill = '#0b1220';

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: c.text,
          backgroundColor: badgeFill,
        },
      ]}
      accessibilityRole="header">
      <Text
        style={[
          styles.text,
          {
            color: c.text,
            fontSize: size,
            textShadowColor: colorScheme === 'dark' ? '#0ea5e9' : '#0b1220',
          },
        ]}
        numberOfLines={1}>
        LivePay
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderRadius: 12,
  },
  text: {
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});
