import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { useEvent } from 'expo';
import Constants from 'expo-constants';
import {
  Stack,
  useNavigationContainerRef,
  usePathname,
  useRouter,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import WorkoutModule, { WorkoutSessionState } from '@/modules/workout';
import 'react-native-reanimated';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import CustomSplashScreen from '@/src/components/SplashScreen';
import { useColorScheme } from '@/src/components/useColorScheme';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { ToastProvider, useToast } from '@/src/contexts/ToastContext';
import { useAppFonts } from '@/src/hooks/useAppFonts';
import {
  isRecordExpired,
  recordRecoveryService,
} from '@/src/services/recordRecoveryService';

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: 'https://1f265665b9cbe66c55ae0f82f9ee0a8a@o4511108762697728.ingest.de.sentry.io/4511108858708048',
  environment:
    process.env.APP_ENV === 'production' ? 'production' : 'development',
  release: Constants.expoConfig?.version ?? '0.0.0',
  integrations: [
    Sentry.reactNativeTracingIntegration(),
    navigationIntegration,
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
    }),
  ],
  tracesSampleRate: 0.2,
  _experiments: {
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  },

  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      delete event.user.username;
    }

    if (event.request?.headers) {
      delete event.request.headers.Authorization;
      delete event.request.headers.authorization;
    }

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
  initialRouteName: 'login/index',
};

SplashScreen.preventAutoHideAsync();

const BG = { flex: 1, backgroundColor: '#151515' } as const;

export default Sentry.wrap(function RootLayout() {
  const [loaded, error] = useAppFonts();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    Sentry.crashedLastRun().then((crashed) => {
      if (crashed) {
        Sentry.captureMessage('앱이 이전 세션에서 비정상 종료됨', 'warning');
      }
    });
  }, []);

  if (!loaded) return <View style={BG} />;

  return <RootLayoutNav />;
});

function FailedRecordsChecker() {
  const { showToast } = useToast();
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (hasShownRef.current) return;
    hasShownRef.current = true;

    recordRecoveryService.getFailedRecords().then((records) => {
      const activeCount = records.filter((r) => !isRecordExpired(r)).length;
      if (activeCount > 0) {
        showToast(`저장 실패한 기록 ${activeCount}개가 있어요.`);
      }
    });
  }, [showToast]);

  return null;
}

function AuthenticatedLayout() {
  const { user, isLoading, isOnboardingComplete } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasNavigatedOnLoad = useRef(false);

  const { sessionState: workoutSessionState } = useEvent(
    WorkoutModule,
    'onWorkoutStateChange',
    { sessionState: WorkoutSessionState.NotStarted },
  );

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

  useEffect(() => {
    if (isLoading || !user || !hasNavigatedOnLoad.current) return;
    if (
      (workoutSessionState === WorkoutSessionState.Running ||
        workoutSessionState === WorkoutSessionState.Paused) &&
      !pathname.startsWith('/record')
    ) {
      router.push('/record');
    }
  }, [workoutSessionState, isLoading, user, pathname, router]);

  if (isLoading) {
    return <CustomSplashScreen />;
  }

  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='login/index' options={{ headerShown: false }} />
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
        <Stack.Screen
          name='failedRecords/index'
          options={{ headerShown: false }}
        />
        <Stack.Screen name='modal' options={{ presentation: 'modal' }} />
      </Stack>
      {user && isOnboardingComplete && <FailedRecordsChecker />}
    </ToastProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

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
