import { WorkoutErrorState } from './Workout.types';

type WorkoutErrorPayload = {
  state: WorkoutErrorState;
};

export class WorkoutError extends Error {
  public readonly timestamp: Date;
  public readonly code: string;
  public readonly suggestion: string;

  constructor(state: WorkoutErrorState) {
    super(state.message);
    this.name = 'WorkoutError';
    this.timestamp = new Date(state.timeStamp);
    this.code = state.code;
    this.suggestion = state.suggestion;
  }

  static convertNativeError(error: unknown): WorkoutError {
    try {
      if (error instanceof Error) {
        // TODO: zod 파싱 처리
        const payload: WorkoutErrorPayload = JSON.parse(error.message);

        return new WorkoutError(payload.state);
      }

      return new WorkoutError({
        timeStamp: new Date(),
        code: 'UNKNOWN_ERROR',
        suggestion: '개발자 문의가 필요합니다.',
        message: '알 수 없는 오류가 발생했습니다.',
      });
    } catch {
      return new WorkoutError({
        timeStamp: new Date(),
        code: 'PARSE_ERROR',
        suggestion: 'JSON 직렬화 부분을 확인해주세요.',
        message: 'JSON 파싱중 에러가 발생했습니다.',
      });
    }
  }
}
