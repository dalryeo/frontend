import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getWeeklyRecordSummary } from '../services/recordService';
import { WeeklyRecordSummary } from '../types/record';

export const useWeeklyRecord = () => {
  const [weeklyRecord, setWeeklyRecord] = useState<WeeklyRecordSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken } = useAuth();

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

      if (response.success && response.data && !('code' in response.data)) {
        setWeeklyRecord(response.data);
      } else if ('code' in response.data && response.data.code === 'AC-006') {
        console.log('🔄 토큰 만료로 인한 기록 없음');
        setWeeklyRecord(null);
        setError(null);
      }
    } catch (err) {
      console.error('주간 기록 조회 오류:', err);
      setWeeklyRecord(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

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
