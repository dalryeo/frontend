import { useEvent } from 'expo';

import WorkoutModule, {
  WorkoutMetrics,
  WorkoutSessionState,
} from '../modules/workout';
import { useWorkoutPermissions } from './useWorkoutPermissions';

const initialWorkoutState = {
  sessionState: WorkoutSessionState.NotStarted,
};

const initialWorkoutMetrics: WorkoutMetrics = {
  sessionState: initialWorkoutState.sessionState,
  elapsedTime: 0,
  distance: 0,
  pace: 0,
  calories: 0,
  averageHeartRate: 0,
  heartRate: 0,
};

export const useWorkout = () => {
  const permissions = useWorkoutPermissions();

  const metrics = useEvent(
    WorkoutModule,
    'onMetricsUpdate',
    initialWorkoutMetrics
  );

  const { sessionState } = useEvent(
    WorkoutModule,
    'onWorkoutStateChange',
    initialWorkoutState
  );

  const error = useEvent(WorkoutModule, 'onWorkoutError', null);

  return { metrics, sessionState, error, ...permissions };
};
