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

      if (!token) {
        setWeeklyRecord(null);
        return;
      }

      const response = await getWeeklyRecordSummary(token);

      if (response.success && response.data) {
        setWeeklyRecord({
          currentTier: response.data.currentTier,
          currentTierGrade: response.data.currentTierGrade,
          weeklyCount: response.data.weeklyCount,
          weeklyAvgPace: response.data.weeklyAvgPace,
          weeklyDistance: response.data.weeklyDistance,
        });

        if (hasErrorCode(response.data)) {
          if (response.data.code === 'AC-006') {
            console.log('AC-006 에러 - 토큰 관련 문제');
            setWeeklyRecord(null);
            await forceLogout();
            return;
          }
        } else if (isValidWeeklyRecord(response.data)) {
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
    }
  }, [getAccessToken, forceLogout]);

  useEffect(() => {
    fetchWeeklyRecord();
  }, [fetchWeeklyRecord]);

  return {
    weeklyRecord,
    loading,
    error,
    refetch: fetchWeeklyRecord,
  };
};
