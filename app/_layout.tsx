import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { useColorScheme } from '@/src/components/useColorScheme';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { useAppFonts } from '@/src/hooks/useAppFonts';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useAppFonts();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            <Stack.Screen name='login' options={{ headerShown: false }} />
            <Stack.Screen
              name='startRecord/index'
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='profile/index'
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='tierRecommend/index'
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='healthPermission/index'
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name='locationPermission/index'
              options={{ headerShown: false }}
            />
            <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
