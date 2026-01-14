import { BASE_URL } from '../config/api';
import { WeeklyRecordResponse } from '../types/record';

export const getWeeklyRecordSummary = async (
  token: string,
): Promise<WeeklyRecordResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/records/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message ?? 'WEEKLY_RECORD_FETCH_FAILED');
    }

    return result;
  } catch (error) {
    console.error('❌ 주간 기록 조회 실패:', error);

    if (
      error instanceof TypeError &&
      error.message.includes('Network request failed')
    ) {
      throw new Error(
        '네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.',
      );
    }

    throw error;
  }
};
