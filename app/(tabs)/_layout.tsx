import { Tabs } from 'expo-router';

import CustomTabBar from '@/src/components/CustomTabBar';
import { useColorScheme } from '@/src/components/useColorScheme';
import Colors from '@/src/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
        }}
      />

      <Tabs.Screen
        name='analysis/index'
        options={{
          headerShown: false,
          tabBarLabel: 'analysis',
        }}
      />

      <Tabs.Screen
        name='ranking/index'
        options={{
          headerShown: false,
          tabBarLabel: 'ranking',
        }}
      />
    </Tabs>
  );
}
