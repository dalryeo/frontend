import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getWeeklyRecordSummary } from '../services/recordService';
import { WeeklyRecordSummary } from '../types/record';

interface ErrorResponse {
  code: string;
  message: string;
}

const hasErrorCode = (data: unknown): data is ErrorResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    typeof (data as Record<string, unknown>).code === 'string'
  );
};

const isValidWeeklyRecord = (data: unknown): data is WeeklyRecordSummary => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'currentTier' in data &&
    'weeklyCount' in data &&
    typeof (data as Record<string, unknown>).currentTier === 'string' &&
    typeof (data as Record<string, unknown>).weeklyCount === 'number'
  );
};

export const useWeeklyRecord = () => {
  const [weeklyRecord, setWeeklyRecord] = useState<WeeklyRecordSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken, forceLogout } = useAuth();

  const fetchWeeklyRecord = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAccessToken();
      console.log('🔍 토큰 확인:', token ? '토큰 존재' : '토큰 없음');

      if (!token) {
        console.log('토큰이 없어서 기록 조회 중단');
        setWeeklyRecord(null);
        return;
      }

      console.log('API 호출 시작: /records/summary');
      const response = await getWeeklyRecordSummary(token);
      console.log('API 응답 전체:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        if (hasErrorCode(response.data)) {
          if (response.data.code === 'AC-006') {
            console.log('AC-006 에러 - 토큰 관련 문제');
            setWeeklyRecord(null);
            await forceLogout();
            return;
          }
        } else if (isValidWeeklyRecord(response.data)) {
          console.log('주간 기록 데이터 설정:', response.data);
          setWeeklyRecord(response.data);
        } else {
          console.log('올바르지 않은 데이터 형식:', response.data);
          setWeeklyRecord(null);
        }
      } else {
        console.log('기록 데이터 없음 또는 기타 응답:', response);
        setWeeklyRecord(null);
      }
    } catch (err) {
      console.error('주간 기록 조회 오류:', err);
      setWeeklyRecord(null);
      setError(null);
    } finally {
      setLoading(false);
      console.log('fetchWeeklyRecord 완료');
    }
  }, [getAccessToken, forceLogout]);

  useEffect(() => {
    console.log('useWeeklyRecord 초기 로드');
    fetchWeeklyRecord();
  }, [fetchWeeklyRecord]);

  return {
    weeklyRecord,
    loading,
    error,
    refetch: fetchWeeklyRecord,
  };
};
