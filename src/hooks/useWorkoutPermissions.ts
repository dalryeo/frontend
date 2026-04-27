import { useEventListener } from 'expo';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import WorkoutModule, {
  workoutModule,
  type WorkoutPermissionStatus,
} from '@/modules/workout';

interface UseWorkoutPermissionsReturn {
  permissions: WorkoutPermissionStatus;
  hasAllPermissions: boolean;
  isRequesting: boolean;
  checkPermissions: () => Promise<WorkoutPermissionStatus>;
  requestPermissions: () => Promise<WorkoutPermissionStatus>;
  requestHealthPermission: () => Promise<WorkoutPermissionStatus>;
  requestLocationPermission: () => Promise<WorkoutPermissionStatus>;
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
    },
  );

  const checkPermissions = async (): Promise<WorkoutPermissionStatus> => {
    setIsRequesting(true);
    try {
      const result = await Promise.race([
        workoutModule.checkPermissions(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 5000),
        ),
      ]);
      if (result.success) {
        setHealthKit(result.data.healthKit);
        setLocation(result.data.location);
        return result.data;
      }
    } catch {
      // 타임아웃 또는 에러 시 현재 상태 유지
    } finally {
      setIsRequesting(false);
    }
    return { healthKit: false, location: false };
  };

  const executePermissionRequest = async (
    authorize: () => Promise<unknown>,
  ): Promise<WorkoutPermissionStatus> => {
    setIsRequesting(true);
    try {
      await authorize();
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

  const requestPermissions = () =>
    executePermissionRequest(async () => {
      await workoutModule.requestHealthAuthorization();
      await workoutModule.requestLocationAuthorization();
    });

  const requestHealthPermission = () =>
    executePermissionRequest(() => workoutModule.requestHealthAuthorization());

  const requestLocationPermission = () =>
    executePermissionRequest(() =>
      workoutModule.requestLocationAuthorization(),
    );

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
    requestHealthPermission,
    requestLocationPermission,
    requestPermissions,
  };
};
