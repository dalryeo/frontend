import { ExpoConfig } from '@expo/config-types';
/**
 * Config Plugin for Workout
 * iOS 단독 운동에 필요한 권한과 기능들을 자동으로 추가처리하는 플러그인.
 */
declare const withIosRunning: (config: ExpoConfig) => ExpoConfig;
export default withIosRunning;
