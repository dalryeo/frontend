import { ExpoConfig } from '@expo/config-types';

import withIosRunning from '../ios/withIosRunning';
import withWatchRunning from '../ios/withWatchRunning';

const withAppleRunning = (config: ExpoConfig) => {
  config = withIosRunning(config);
  config = withWatchRunning(config);

  return config;
};

export default withAppleRunning;
