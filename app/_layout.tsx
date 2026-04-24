import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import 'react-native-reanimated';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { WorkoutDebugScreen } from '@/src/components/Debug/WorkoutDebugScreen';
import CustomSplashScreen from '@/src/components/SplashScreen';
import { useColorScheme } from '@/src/components/useColorScheme';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { ToastProvider } from '@/src/contexts/ToastContext';
import { useAppFonts } from '@/src/hooks/useAppFonts';

Sentry.init({
  dsn: 'https://1f265665b9cbe66c55ae0f82f9ee0a8a@o4511108762697728.ingest.de.sentry.io/4511108858708048',
  environment: 'prod',
  release: 'mvp-dev',

  beforeSend(event) {
    // user 개인정보 제거
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      delete event.user.username;
    }

    // Authorization 헤더 제거
    if (event.request?.headers) {
      delete event.request.headers.Authorization;
      delete event.request.headers.authorization;
    }

    // breadcrumb 토큰 마스킹
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((b) => {
        if (typeof b.data === 'object') {
          const data = { ...b.data };

          if (data.token) data.token = '[Filtered]';
          if (data.accessToken) data.accessToken = '[Filtered]';
          if (data.Authorization) data.Authorization = '[Filtered]';

          return { ...b, data };
        }
        return b;
      });
    }

    return event;
  },
});

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useAppFonts();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const prepare = async () => {
      if (!loaded) return;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setReady(true);
      await SplashScreen.hideAsync();
    };

    prepare();
  }, [loaded]);

  if (!ready) {
    return <CustomSplashScreen />;
  }

  // 디버거
  if (Constants.expoConfig?.extra?.IS_DEBUG === 'false') {
    return <WorkoutDebugScreen />;
  }

  return <RootLayoutNav />;
}

function AuthenticatedLayout() {
  const { user, isLoading, isOnboardingComplete } = useAuth();
  const router = useRouter();
  const hasNavigatedOnLoad = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      if (!hasNavigatedOnLoad.current) {
        hasNavigatedOnLoad.current = true;
        if (!user) {
          router.replace('/login');
        } else if (!isOnboardingComplete) {
          router.replace('/startRecord');
        } else {
          router.replace('/(tabs)');
        }
      } else if (!user) {
        router.replace('/login');
      }
    }
  }, [user, isLoading, isOnboardingComplete, router]);

  if (isLoading) {
    return <CustomSplashScreen />;
  }

  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='login' options={{ headerShown: false }} />
        <Stack.Screen
          name='startRecord/index'
          options={{ headerShown: false }}
        />
        <Stack.Screen name='profile/index' options={{ headerShown: false }} />
        <Stack.Screen
          name='profileEdit/index'
          options={{ headerShown: false }}
        />
        <Stack.Screen name='userGuide/index' options={{ headerShown: false }} />
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
    </ToastProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <AuthenticatedLayout />
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
