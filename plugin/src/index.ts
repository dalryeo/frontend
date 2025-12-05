import { ExpoConfig } from '@expo/config-types';

import withIosRunning from '../ios/withIosRunning';
import withWatchRunning from '../ios/withWatchRunning';
import { DEFAULT_FILES } from '../ios/xcode/types';

const withAppleRunning = (config: ExpoConfig) => {
  config = withIosRunning(config);
  config = withWatchRunning(config, {
    deploymentTarget: '10.0',
    files: DEFAULT_FILES,
  });

  return config;
};

export default withAppleRunning;
