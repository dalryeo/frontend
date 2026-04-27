import { BASE_URL } from '../config/api';
import { fetchWithTokenRefresh } from './apiClient';

type RefreshTokenCallback = () => Promise<string | null>;

let refreshTokenCallback: RefreshTokenCallback | null = null;

export const setAnalysisRefreshTokenCallback = (
  callback: RefreshTokenCallback,
) => {
  refreshTokenCallback = callback;
};

export interface AnalysisRecord {
  recordId: number;
  distanceKm: number;
  durationSec: number;
  avgPaceSecPerKm: number;
  bpm: number;
  date: string;
}

export interface AnalysisRecordsResponse {
  success: boolean;
  data: {
    total: number;
    records: AnalysisRecord[];
  };
}

export const analysisService = {
  async getAnalysisRecords(
    page: number = 1,
    sort: 'latest' | 'pace' | 'distance' = 'latest',
    token: string,
  ): Promise<AnalysisRecordsResponse> {
    try {
      const response = await fetchWithTokenRefresh(
        `${BASE_URL}/analysis/records?page=${page}&sort=${sort}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
        refreshTokenCallback,
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error?.message ?? 'ANALYSIS_RECORDS_FETCH_FAILED',
        );
      }

      return result;
    } catch (error) {
      console.error('분석 기록 조회 실패:', error);

      if (error instanceof Error) {
        if (error.message === 'TOKEN_EXPIRED') {
          throw error;
        }

        if (
          error instanceof TypeError &&
          error.message.includes('Network request failed')
        ) {
          throw new Error(
            '네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.',
          );
        }
      }

      throw error;
    }
  },
};

// export 함수
export const getAnalysisRecords = analysisService.getAnalysisRecords;
