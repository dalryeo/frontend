import {
  Result,
  WorkoutPermissionStatus,
  wrapResult,
} from './src/Workout.types';
import { WorkoutError } from './src/WorkoutError';
import WorkoutModuleNative from './src/WorkoutModule';

export * from './src/Workout.types';
export { default } from './src/WorkoutModule';

/**
 * 운동 세션을 제어하는 모듈
 *
 * @remarks
 * - 모든 비동기 메서드는 Result 타입을 반환하여 명시적 에러 처리 가능
 * - 운동 시작 전 반드시 권한 확인 필요 (checkPermissions)
 * - 세션 생명주기: NotStarted → Running ⇄ Paused → Ended
 *
 * @example
 * // 기본 사용 흐름
 * const perms = await workoutModule.checkPermissions();
 * if (!perms.success) return;
 *
 * await workoutModule.start();
 * // ... 운동 중 ...
 * await workoutModule.end();
 */
export const workoutModule = {
  /**
   * 운동 세션 시작
   * @returns 성공 시 세션 상태가 Running으로 전환됨
   * @throws WorkoutError - 권한 미허용, 이미 진행 중인 세션 존재 시
   */
  start: (): Promise<Result<void, WorkoutError>> =>
    wrapResult(WorkoutModuleNative.startWorkout()),

  /**
   * 운동 일시정지
   * @returns 성공 시 세션 상태가 Paused로 전환됨
   * @throws WorkoutError - 세션이 Running 상태가 아닐 때
   */
  pause: (): Promise<Result<void, WorkoutError>> =>
    wrapResult(WorkoutModuleNative.pauseWorkout()),

  /**
   * 일시정지된 운동 재개
   * @returns 성공 시 세션 상태가 Running으로 전환됨
   * @throws WorkoutError - 세션이 Paused 상태가 아닐 때
   */
  resume: (): Promise<Result<void, WorkoutError>> =>
    wrapResult(WorkoutModuleNative.resumeWorkout()),

  /**
   * 운동 세션 종료 및 HealthKit에 저장
   * @returns 성공 시 세션 상태가 Ended로 전환, 데이터가 Health 앱에 저장됨
   * @throws WorkoutError - 활성 세션이 없을 때
   */
  end: (): Promise<Result<void, WorkoutError>> =>
    wrapResult(WorkoutModuleNative.endWorkout()),

  /**
   * 세션 상태를 NotStarted로 초기화 (동기)
   * @remarks Ended 상태에서 새 운동 시작 전 호출
   */
  reset: () => WorkoutModuleNative.resetWorkout(),

  /**
   * 현재 운동 메트릭 조회 (동기)
   * @returns 거리, 페이스, 칼로리, 심박수 등 현재 측정값
   * @remarks 실시간 UI 업데이트용 - 이벤트 구독 권장
   */
  getCurrentMetrics: () => WorkoutModuleNative.getCurrentMetrics(),

  /**
   * 위치 권한 요청
   * @returns 사용자가 권한 허용/거부 후 resolve
   * @remarks "앱 사용 중" 권한 필요 (Always 불필요)
   */
  requestLocationAuthorization: (): Promise<Result<void, WorkoutError>> =>
    wrapResult(WorkoutModuleNative.requestLocationAuthorization()),

  /**
   * HealthKit 권한 요청
   * @returns 사용자가 Health 앱에서 권한 설정 후 resolve
   * @remarks 읽기/쓰기 권한 모두 요청됨
   */
  requestHealthAuthorization: (): Promise<Result<void, WorkoutError>> =>
    wrapResult(WorkoutModuleNative.requestHealthAuthorization()),

  /**
   * 현재 권한 상태 확인
   * @returns healthKit, location 각각의 허용 여부
   *
   * @example
   * const result = await workoutModule.checkPermissions();
   * if (result.success) {
   *   const { healthKit, location } = result.data;
   *   if (healthKit && location) {
   *     // 운동 시작 가능
   *   }
   * }
   */
  checkPermissions: (): Promise<
    Result<WorkoutPermissionStatus, WorkoutError>
  > => wrapResult(WorkoutModuleNative.checkPermissions()),
};
