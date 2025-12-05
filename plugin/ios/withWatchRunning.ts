import { ConfigPlugin, withPlugins } from 'expo/config-plugins';
import { withXcode } from './xcode/withXcode';

/**
 * Config Plugin for Workout
 * 애플워치 + 아이폰 미러링 운동에 필요한 권한과 기능들을 자동으로 추가처리하는 플러그인.
 */
const withWatchRunning: ConfigPlugin = (config) => {
  const deploymentTarget = '10.0';
  const displayName = config.name;
  const bundleIdentifier = config.ios?.bundleIdentifier;
  const targetName = `${displayName} Watch App`;

  config = withPlugins(config, [
    [
      withXcode,
      {
        name: displayName,
        targetName,
        bundleIdentifier,
        deploymentTarget,
      },
    ],
  ]);

  return config;
};

export default withWatchRunning;
