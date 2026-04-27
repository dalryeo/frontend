import { BASE_URL } from '../config/api';
import {
  RecordSaveRequest,
  RecordSaveResponse,
  WeeklyRecordResponse,
} from '../types/record';
import { assertApiSuccess, throwIfNetworkError } from '../utils/apiUtils';
import { fetchWithTokenRefresh } from './apiClient';

type RefreshTokenCallback = () => Promise<string | null>;

type SaveRecordResult = {
  success: boolean;
  data?: { message?: string };
  error?: { message?: string };
  message?: string;
};

let refreshTokenCallback: RefreshTokenCallback | null = null;

export const setRefreshTokenCallback = (callback: RefreshTokenCallback) => {
  refreshTokenCallback = callback;
};
export const recordService = {
  async getWeeklyRecordSummary(token: string): Promise<WeeklyRecordResponse> {
    const response = await fetchWithTokenRefresh(
      `${BASE_URL}/weekly/summary/current`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      refreshTokenCallback,
      0,
      false,
    );

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message ?? 'WEEKLY_SUMMARY_FETCH_FAILED');
    }
    return result;
  },

  async saveRecord(
    recordData: RecordSaveRequest,
    token: string,
  ): Promise<RecordSaveResponse> {
    try {
      const response = await fetchWithTokenRefresh(
        `${BASE_URL}/records`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(recordData),
        },
        refreshTokenCallback,
      );

      const text = await response.text();
      const result = JSON.parse(text) as SaveRecordResult;

      if (!response.ok) {
        const errorMsg =
          result.data?.message ||
          result.error?.message ||
          result.message ||
          `HTTP ${response.status}: 기록 저장 실패`;
        throw new Error(errorMsg);
      }

      assertApiSuccess(result, 'RECORD_SAVE_FAILED');
      return result as RecordSaveResponse;
    } catch (error) {
      throwIfNetworkError(error);
      throw error;
    }
  },
};

export const getWeeklyRecordSummary =
  recordService.getWeeklyRecordSummary.bind(recordService);
