import { BASE_URL } from '../config/api';
import { throwIfNetworkError } from '../utils/apiUtils';
import { fetchWithTokenRefresh } from './apiClient';

type RefreshTokenCallback = () => Promise<string | null>;

let refreshTokenCallback: RefreshTokenCallback | null = null;

export const setWeeklyRefreshTokenCallback = (
  callback: RefreshTokenCallback,
) => {
  refreshTokenCallback = callback;
};

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
        refreshTokenCallback,
      );
      return response.json();
    } catch (error) {
      throwIfNetworkError(error);
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
        refreshTokenCallback,
      );
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error?.message ?? 'WEEKLY_RECORDS_FETCH_FAILED');
      }
      return result;
    } catch (error) {
      throwIfNetworkError(error);
      throw error;
    }
  },
};

export const getWeeklySummaryList =
  weeklyService.getWeeklySummaryList.bind(weeklyService);
export const getWeeklyRecords =
  weeklyService.getWeeklyRecords.bind(weeklyService);
