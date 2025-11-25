import { NativeModule, requireNativeModule } from 'expo';

import {
  WorkoutPermissionStatus,
  WorkoutMetrics,
  WorkoutModuleEvents,
} from './Workout.types';

declare class WorkoutModule extends NativeModule<WorkoutModuleEvents> {
  startWorkout(): Promise<void>;
  pauseWorkout(): Promise<void>;
  resumeWorkout(): Promise<void>;
  endWorkout(): Promise<void>;
  resetWorkout(): void;
  getCurrentMetrics(): WorkoutMetrics;
  requestLocationAuthorization(): Promise<void>;
  requestHealthAuthorization(): Promise<void>;
  checkPermissions(): Promise<WorkoutPermissionStatus>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<WorkoutModule>('Workout');
