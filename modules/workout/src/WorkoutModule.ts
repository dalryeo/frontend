import { NativeModule, requireNativeModule } from 'expo';

import {
  WorkoutMetrics,
  WorkoutMode,
  WorkoutModuleEvents,
  WorkoutPermissionStatus,
} from './Workout.types';

declare class WorkoutModule extends NativeModule<WorkoutModuleEvents> {
  startWorkout(): Promise<void>;
  pauseWorkout(): Promise<void>;
  resumeWorkout(): Promise<void>;
  endWorkout(): Promise<void>;
  resetWorkout(): Promise<void>;
  getCurrentMetrics(): Promise<WorkoutMetrics>;
  requestLocationAuthorization(): Promise<void>;
  requestHealthAuthorization(): Promise<void>;
  checkPermissions(): Promise<WorkoutPermissionStatus>;
  getWorkoutMode(): Promise<WorkoutMode>;
  syncWatchState(): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<WorkoutModule>('Workout');
