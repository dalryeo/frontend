import WorkoutModuleNative, { WatchState } from '@/modules/workout';
import { useEventListener } from 'expo';
import { useState } from 'react';

export const useWatchState = () => {
  const [watchState, setWatchState] = useState<WatchState>({
    isPaired: false,
    isWatchAppInstalled: false,
    isReachable: false,
    isFallback: false,
    isWatchMode: false,
  });

  useEventListener(
    WorkoutModuleNative,
    'onWatchStateChange',
    (payload: WatchState) => {
      setWatchState(payload);
    },
  );

  return watchState;
};
