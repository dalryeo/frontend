import { WorkoutError } from './WorkoutError';

export enum WorkoutSessionState {
  NotStarted = 'notStarted',
  Prepared = 'prepared',
  Running = 'running',
  Paused = 'paused',
  Ended = 'ended',
  Stopped = 'stopped',
}

export type WorkoutMetrics = {
  sessionState: WorkoutSessionState;
  elapsedTime: number;
  distance: number;
  pace: number;
  calories: number;
  averageHeartRate: number;
  heartRate: number;
};

export type WorkoutErrorState = {
  timeStamp: Date | string;
  code: string;
  suggestion: string;
  message: string;
};

export type WorkoutPermissionStatus = {
  healthKit: boolean;
  location: boolean;
};

export type WorkoutModuleEvents = {
  onMetricsUpdate(payload: WorkoutMetrics): void;
  onWorkoutStateChange(payload: { sessionState: WorkoutSessionState }): void;
  onWorkoutError(payload: WorkoutErrorState): void;
  onLocationAuthChange(payload: { locationPermission: boolean }): void;
};

/**
 * 성공/실패를 명시적으로 표현하는 Result 타입
 * @template T - 성공 시 반환되는 데이터 타입
 * @template E - 실패 시 반환되는 에러 타입 (기본: Error)
 *
 * @example
 * const result = await workoutModule.start();
 * if (result.success) {
 *   console.log('운동 시작됨');
 * } else {
 *   console.error(result.error.message);
 * }
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Promise를 Result 타입으로 래핑하여 try-catch 없이 에러 처리 가능하게 함
 */
export const wrapResult = async <T>(
  promise: Promise<T>
): Promise<Result<T, WorkoutError>> => {
  try {
    const data = await promise;
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: WorkoutError.convertNativeError(error),
    };
  }
};
