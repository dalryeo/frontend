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

  const checkPermissions = async () => {
    setIsRequesting(true);
    try {
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

  const requestPermissions = async () => {
    setIsRequesting(true);
    try {
      await workoutModule.requestHealthAuthorization();
      await workoutModule.requestLocationAuthorization();

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

  const requestHealthPermission = async () => {
    setIsRequesting(true);
    try {
      await workoutModule.requestHealthAuthorization();

      const result = await workoutModule.checkPermissions();

      if (result.success) {
        setHealthKit(result.data.healthKit);
        return result.data;
      }
    } finally {
      setIsRequesting(false);
    }
    return { healthKit: false, location: false };
  };

  const requestLocationPermission = async () => {
    setIsRequesting(true);
    try {
      await workoutModule.requestLocationAuthorization();

      const result = await workoutModule.checkPermissions();

      if (result.success) {
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
    requestHealthPermission,
    requestLocationPermission,
    requestPermissions,
  };
};
