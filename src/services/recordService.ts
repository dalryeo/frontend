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

export type RecordErrorType =
  | 'TOKEN_EXPIRED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'REQUEST_ERROR'
  | 'UNKNOWN_ERROR';

export interface RecordError extends Error {
  type: RecordErrorType;
  userMessage: string;
}

const createRecordError = (
  type: RecordErrorType,
  message: string,
  userMessage: string,
): RecordError => {
  const error = new Error(message) as RecordError;
  error.type = type;
  error.userMessage = userMessage;
  return error;
};

const classifyRecordError = (error: unknown): RecordError => {
  if (error instanceof Error) {
    if (error.message === 'TOKEN_EXPIRED') {
      return createRecordError(
        'TOKEN_EXPIRED',
        'Token expired',
        '로그인 정보가 만료되었습니다. 다시 로그인해주세요.',
      );
    }
    if (
      error.message.includes('네트워크 연결') ||
      error.message.includes('Network')
    ) {
      return createRecordError(
        'NETWORK_ERROR',
        error.message,
        '네트워크 연결을 확인해주세요.',
      );
    }
    if (
      error.message.includes('기록 정보 오류') ||
      error.message.includes('VALIDATION')
    ) {
      return createRecordError(
        'VALIDATION_ERROR',
        error.message,
        '기록 정보가 올바르지 않습니다. 다시 시도해주세요.',
      );
    }
    if (error.message.includes('HTTP 5')) {
      return createRecordError(
        'SERVER_ERROR',
        error.message,
        '서버 일시 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
    if (error.message.includes('HTTP')) {
      return createRecordError(
        'REQUEST_ERROR',
        error.message,
        '요청이 올바르지 않습니다. 다시 시도해주세요.',
      );
    }
  }
  return createRecordError(
    'UNKNOWN_ERROR',
    String(error),
    '기록 저장 중 오류가 발생했습니다. 앱을 재시작해주세요.',
  );
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
      throw classifyRecordError(error);
    }
  },
};

export const getWeeklyRecordSummary =
  recordService.getWeeklyRecordSummary.bind(recordService);
