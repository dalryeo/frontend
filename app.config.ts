import { ConfigContext, ExpoConfig } from 'expo/config';

const IS_PROD = process.env.APP_ENV === 'production';
const BUNDLE_SUFFIX = process.env.BUNDLE_SUFFIX || 'unknown';
const BUNDLE_ID = {
  ios: IS_PROD ? 'com.ios.dalryeo' : `com.ios.dalryeo.${BUNDLE_SUFFIX}`,
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
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: 'NEUTRAL.MAIN',
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
  },
});
