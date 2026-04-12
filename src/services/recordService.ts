import { BASE_URL } from '../config/api';
import {
  RecordSaveRequest,
  RecordSaveResponse,
  WeeklyRecordResponse,
} from '../types/record';
import { fetchWithTokenRefresh } from './apiClient';

type RefreshTokenCallback = () => Promise<string | null>;

let refreshTokenCallback: RefreshTokenCallback | null = null;

export const setRefreshTokenCallback = (callback: RefreshTokenCallback) => {
  refreshTokenCallback = callback;
};

export const recordService = {
  async getWeeklyRecordSummary(token: string): Promise<WeeklyRecordResponse> {
    const url = `${BASE_URL}/weekly/summary/current`;

    const response = await fetchWithTokenRefresh(
      url,
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
      const requestData: RecordSaveRequest = recordData;

      const validationErrors = [];
      if (requestData.distanceKm === undefined || requestData.distanceKm < 0) {
        validationErrors.push(
          `거리가 유효하지 않음: ${requestData.distanceKm}`,
        );
      }
      if (!requestData.durationSec || requestData.durationSec <= 0) {
        validationErrors.push(
          `시간이 유효하지 않음: ${requestData.durationSec}`,
        );
      }
      if (!requestData.avgPaceSecPerKm || requestData.avgPaceSecPerKm <= 0) {
        validationErrors.push(
          `페이스가 유효하지 않음: ${requestData.avgPaceSecPerKm}`,
        );
      }
      if (
        requestData.caloriesKcal === undefined ||
        requestData.caloriesKcal < 0
      ) {
        validationErrors.push(
          `칼로리가 유효하지 않음: ${requestData.caloriesKcal}`,
        );
      }
      if (!requestData.startAt || !requestData.endAt) {
        validationErrors.push(
          `시작/종료 시간이 유효하지 않음: ${requestData.startAt}, ${requestData.endAt}`,
        );
      }
      if (!requestData.platform) {
        validationErrors.push(
          `플랫폼이 유효하지 않음: ${requestData.platform}`,
        );
      }

      if (validationErrors.length > 0) {
        throw new Error(`데이터 검증 실패: ${validationErrors.join(', ')}`);
      }

      const response = await fetchWithTokenRefresh(
        `${BASE_URL}/records`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        },
        refreshTokenCallback,
      );

      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error(`서버 응답 파싱 실패: ${responseText}`);
      }

      if (!response.ok) {
        const errorMessage =
          result?.data?.message ||
          result?.error?.message ||
          result?.message ||
          `HTTP ${response.status}: 기록 저장 실패`;

        throw new Error(errorMessage);
      }

      if (!result.success) {
        throw new Error(result.error?.message ?? 'RECORD_SAVE_FAILED');
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (
          error instanceof TypeError &&
          error.message.includes('Network request failed')
        ) {
          throw new Error(
            '네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.',
          );
        }

        if (error instanceof SyntaxError) {
          throw new Error('서버 응답 형식이 올바르지 않습니다.');
        }

        if (
          error.message.includes('토큰이 만료') ||
          error.message === 'TOKEN_EXPIRED'
        ) {
          console.error('토큰 만료 - 재로그인 필요');
          throw error;
        } else if (error.message.includes('HTTP 400')) {
          console.error('400 Bad Request - 요청 데이터 문제');
        } else if (error.message.includes('HTTP 401')) {
          console.error('401 Unauthorized - 인증 문제');
        } else if (error.message.includes('HTTP 403')) {
          console.error('403 Forbidden - 권한 문제');
        } else if (error.message.includes('HTTP 500')) {
          console.error('500 Internal Server Error - 서버 문제');
        }
      }

      throw error;
    }
  },
};

export const getWeeklyRecordSummary = recordService.getWeeklyRecordSummary;
