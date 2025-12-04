import { ConfigPlugin, withPlugins } from 'expo/config-plugins';
import { withXcode } from './xcode/withXcode';

const withWatchApp: ConfigPlugin = (config) => {
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

export default withWatchApp;
