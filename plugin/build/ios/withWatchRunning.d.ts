import { ConfigPlugin } from 'expo/config-plugins';
import { WithWatchRunningOptions } from './xcode/types';
/**
 * Config Plugin for Workout
 * 애플워치 + 아이폰 미러링 운동에 필요한 권한과 기능들을 자동으로 추가처리하는 플러그인.
 */
declare const withWatchRunning: ConfigPlugin<WithWatchRunningOptions>;
export default withWatchRunning;
