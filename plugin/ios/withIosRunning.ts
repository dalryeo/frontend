import { ExpoConfig } from '@expo/config-types';
import { withEntitlementsPlist, withInfoPlist } from 'expo/config-plugins';

/**
 * Config Plugin for Workout
 * iOS 단독 운동에 필요한 권한과 기능들을 자동으로 추가처리하는 플러그인.
 */
const withIosRunning = (config: ExpoConfig): ExpoConfig => {
  config = withInfoPlist(config, (infoPlistConfiguration) => {
    // 권한 메시지 설정
    infoPlistConfiguration.modResults.NSHealthShareUsageDescription =
      infoPlistConfiguration.modResults.NSHealthShareUsageDescription ||
      '달려 앱은 러닝 운동 데이터를 HealthKit에 저장하고 읽기 위해 건강 데이터 접근 권한이 필요합니다.';

    infoPlistConfiguration.modResults.NSHealthUpdateUsageDescription =
      infoPlistConfiguration.modResults.NSHealthUpdateUsageDescription ||
      '달려 앱은 러닝 운동 기록을 HealthKit에 저장하기 위해 건강 데이터 쓰기 권한이 필요합니다.';

    // Background modes 설정
    if (!infoPlistConfiguration.modResults.UIBackgroundModes) {
      infoPlistConfiguration.modResults.UIBackgroundModes = [];
    }

    const backgroundModes = infoPlistConfiguration.modResults.UIBackgroundModes;

    // GPS 추적을 위한 위치 권한
    if (!backgroundModes.includes('location')) {
      backgroundModes.push('location');
    }

    if (!backgroundModes.includes('workout-processing')) {
      backgroundModes.push('workout-processing');
    }

    return infoPlistConfiguration;
  });

  // 2. Entitlements 설정
  config = withEntitlementsPlist(config, (entitlementsConfiguration) => {
    entitlementsConfiguration.modResults['com.apple.developer.healthkit'] =
      true;
    entitlementsConfiguration.modResults[
      'com.apple.developer.healthkit.access'
    ] = [];

    return entitlementsConfiguration;
  });

  return config;
};

export default withIosRunning;
