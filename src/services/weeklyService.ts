import { BASE_URL } from '../config/api';

type RefreshTokenCallback = () => Promise<string | null>;

let refreshTokenCallback: RefreshTokenCallback | null = null;

export const setWeeklyRefreshTokenCallback = (
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

export interface WeeklySummaryData {
  weekStart: string;
  tierCode: string;
  tierGrade: string;
  runCount: number;
  averagePace: number;
  weeklyDistance: number;
}

export interface WeeklySummaryListResponse {
  success: boolean;
  data: WeeklySummaryData[];
}

export interface WeeklyRecord {
  recordId: number;
  platform: string;
  distanceKm: number;
  durationSec: number;
  avgPaceSecPerKm: number;
  avgHeartRate: number;
  caloriesKcal: number;
  tierCode: string;
  startAt: string;
  endAt: string;
}

export interface WeeklyRecordsResponse {
  success: boolean;
  data: WeeklyRecord[];
}

export const weeklyService = {
  async getWeeklySummaryList(
    token: string,
  ): Promise<WeeklySummaryListResponse> {
    try {
      const response = await fetchWithTokenRefresh(
        `${BASE_URL}/weekly/summary/list`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('주간 요약 목록 조회 실패:', error);
      throw error;
    }
  },

  async getWeeklyRecords(token: string): Promise<WeeklyRecordsResponse> {
    try {
      const response = await fetchWithTokenRefresh(
        `${BASE_URL}/records/weekly`,
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
        throw new Error(result.error?.message ?? 'WEEKLY_RECORDS_FETCH_FAILED');
      }

      return result;
    } catch (error) {
      console.error('주간 기록 목록 조회 실패:', error);
      throw error;
    }
  },
};

export const getWeeklySummaryList = weeklyService.getWeeklySummaryList;
export const getWeeklyRecords = weeklyService.getWeeklyRecords;
