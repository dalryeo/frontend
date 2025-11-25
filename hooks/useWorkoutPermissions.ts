import { useEvent, useEventListener } from 'expo';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import WorkoutModule, {
  workoutModule,
  type WorkoutPermissionStatus,
} from '../modules/workout';

interface UseWorkoutPermissionsReturn {
  permissions: WorkoutPermissionStatus;
  hasAllPermissions: boolean;
  isRequesting: boolean;
  checkPermissions: () => Promise<void>;
  requestPermissions: () => Promise<WorkoutPermissionStatus>;
}

export const useWorkoutPermissions = (): UseWorkoutPermissionsReturn => {
  const [healthKit, setHealthKit] = useState(false);
  const [location, setLocation] = useState(false);
  const [isRequesting, setIsRequesting] = useState(true);

  useEventListener(
    WorkoutModule,
    'onLocationAuthChange',
    ({ locationPermission }) => {
      setLocation(locationPermission);
    }
  );

  const checkPermissions = async () => {
    const result = await workoutModule.checkPermissions();

    if (result.success) {
      setHealthKit(result.data.healthKit);
      setLocation(result.data.location);
    }
    setIsRequesting(false);
  };

  const requestPermissions = async () => {
    setIsRequesting(true);
    try {
      await workoutModule.requestHealthAuthorization();
      await workoutModule.requestLocationAuthorization();
      // 약간의 지연 후 실제 권한 상태 확인 (0.5초)
      await new Promise((resolve) => setTimeout(resolve, 500));
      const result = await workoutModule.checkPermissions();

      if (result.success) {
        setHealthKit(result.data.healthKit);
        setLocation(result.data.location);
        return result.data;
      }
    } finally {
      setIsRequesting(false);
    }
    return { healthKit: false, location: false };
  };

  useEffect(() => {
    checkPermissions();
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') checkPermissions();
    };
    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, []);

  return {
    permissions: { healthKit, location },
    hasAllPermissions: healthKit && location,
    isRequesting,
    checkPermissions,
    requestPermissions,
  };
};
