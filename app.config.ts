import { ConfigContext, ExpoConfig } from 'expo/config';

const IS_PROD = process.env.APP_ENV === 'production';
const BUNDLE_SUFFIX = process.env.BUNDLE_SUFFIX || 'unknown';
const IS_DEBUG = process.env.EXPO_PUBLIC_DEBUG || 'false';
const BUNDLE_ID = {
  ios: IS_PROD ? 'com.dalryeo.ios' : `com.dalryeo.ios.${BUNDLE_SUFFIX}`,
  aos: IS_PROD ? 'com.android.dalryeo' : `com.android.dalryeo.${BUNDLE_SUFFIX}`,
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'dalryeo',
  slug: 'dalryeo',
  scheme: 'dalryeo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/App/Dalryeo_AppIcon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    backgroundColor: '#151515',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: BUNDLE_ID.ios,
    usesAppleSignIn: true,
    icon: './assets/images/App/Dalryeo_AppIcon.png',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/App/Dalryeo_AppIcon.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: BUNDLE_ID.aos,
  },
  plugins: [
    'expo-router',
    '@react-native-community/datetimepicker',
    './plugin/build/src/index.js',
    '@sentry/react-native',
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '17.0',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    IS_PROD,
    IS_DEBUG,
    eas: {
      projectId: 'b7568e91-049f-46ef-8199-adb802621cc3',
    },
  },
});
