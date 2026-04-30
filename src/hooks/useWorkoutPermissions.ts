import { useEventListener } from 'expo';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus, Linking } from 'react-native';

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

  const requestLocationPermission =
    async (): Promise<WorkoutPermissionStatus> => {
      setIsRequesting(true);
      try {
        const current = await workoutModule.checkPermissions();
        if (current.success && current.data.location) {
          setHealthKit(current.data.healthKit);
          setLocation(current.data.location);
          return current.data;
        }

        return await new Promise<WorkoutPermissionStatus>((resolve) => {
          let settled = false;

          const settle = () => {
            if (settled) return;
            settled = true;
            sub.remove();
            clearTimeout(timeoutId);

            workoutModule
              .checkPermissions()
              .then((result) => {
                if (result.success) {
                  setHealthKit(result.data.healthKit);
                  setLocation(result.data.location);
                  resolve(result.data);
                } else {
                  resolve({ healthKit, location: false });
                }
              })
              .catch(() => resolve({ healthKit, location: false }));
          };

          const sub = WorkoutModule.addListener('onLocationAuthChange', settle);

          // 10초 내 응답 없으면 dialog가 뜨지 않은 것 → 설정 앱으로 이동
          const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            sub.remove();
            resolve({ healthKit, location: false });
            Linking.openSettings().catch(console.error);
          }, 10_000);

          workoutModule.requestLocationAuthorization().catch(settle);
        });
      } finally {
        setIsRequesting(false);
      }
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
    requestHealthPermission,
    requestLocationPermission,
    requestPermissions,
  };
};
