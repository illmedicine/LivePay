import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

import { LivePayLogo } from '@/components/LivePayLogo';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerTitle: () => <LivePayLogo />,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => <TabBarIcon name="credit-card" color={color} />,
          headerRight: () => (
            <Pressable onPress={() => router.push('/modal')}>
              {({ pressed }) => (
                <FontAwesome
                  name="info-circle"
                  size={25}
                  color={Colors[colorScheme ?? 'light'].text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Ledger',
          tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
          headerRight: () => (
            <Pressable onPress={() => router.push('/cashout')}>
              {({ pressed }) => (
                <FontAwesome
                  name="arrow-circle-up"
                  size={22}
                  color={Colors[colorScheme ?? 'light'].text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          headerRight: () => (
            <Pressable onPress={() => router.push('/onboarding')}>
              {({ pressed }) => (
                <FontAwesome
                  name="shield"
                  size={22}
                  color={Colors[colorScheme ?? 'light'].text}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}
