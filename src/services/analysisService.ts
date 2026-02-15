import { BASE_URL } from '../config/api';

type RefreshTokenCallback = () => Promise<string | null>;

let refreshTokenCallback: RefreshTokenCallback | null = null;

export const setAnalysisRefreshTokenCallback = (
  callback: RefreshTokenCallback,
) => {
  refreshTokenCallback = callback;
};

async function fetchWithTokenRefresh(
  url: string,
  options: RequestInit,
  retryCount = 0,
): Promise<Response> {
  const response = await fetch(url, options);
  const result = await response.json();

  if (
    result.data?.code === 'AC-006' ||
    result.data?.message?.includes('refreshToken 만료') ||
    result.data?.message?.includes('토큰') ||
    result.message?.includes('토큰') ||
    response.status === 401
  ) {
    if (retryCount < 1 && refreshTokenCallback) {
      const newToken = await refreshTokenCallback();

      if (newToken) {
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        return fetchWithTokenRefresh(url, newOptions, retryCount + 1);
      }
    }

    throw new Error('TOKEN_EXPIRED');
  }

  return new Response(JSON.stringify(result), {
    status: response.status,
    headers: response.headers,
  });
}

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
