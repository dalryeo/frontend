import { Tabs } from 'expo-router';
import React from 'react';

import CustomTabBar from '@/src/components/CustomTabBar';
import { useClientOnlyValue } from '@/src/components/useClientOnlyValue';
import { useColorScheme } from '@/src/components/useColorScheme';
import Colors from '@/src/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          headerShown: false,
          tabBarLabel: '분석',
        }}
      />

      <Tabs.Screen
        name='record'
        options={{
          headerShown: false,
          tabBarLabel: '기록',
        }}
      />

      <Tabs.Screen
        name='ranking'
        options={{
          headerShown: false,
          tabBarLabel: '랭킹',
        }}
      />
    </Tabs>
  );
}
