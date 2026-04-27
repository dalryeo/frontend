import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getWeeklySummaryList,
  setWeeklyRefreshTokenCallback,
  WeeklySummaryData,
} from '../services/weeklyService';
import { addDaysToDate } from '../utils/dateUtils';

interface WeeklyDataItem extends WeeklySummaryData {
  weekEnd: string;
}

export const useWeeklyData = () => {
  const [weeklyDataList, setWeeklyDataList] = useState<WeeklyDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken, forceLogout } = useAuth();

  // 리프레시 토큰 콜백 설정
  useEffect(() => {
    setWeeklyRefreshTokenCallback(getAccessToken);
  }, [getAccessToken]);

  const fetchWeeklyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAccessToken();

      if (!token) {
        setWeeklyDataList([]);
        return;
      }

      const response = await getWeeklySummaryList(token);

      if (response.success && response.data) {
        const validData = response.data.filter((item) => item.runCount > 0);

        const dataWithWeekEnd = validData.map((item) => ({
          ...item,
          weekEnd: addDaysToDate(item.weekStart, 6),
        }));

        setWeeklyDataList(dataWithWeekEnd);
      } else {
        console.log('주간 데이터 없음 또는 기타 응답:', response);
        setWeeklyDataList([]);
      }
    } catch (err) {
      console.error('주간 데이터 조회 오류:', err);

      if (err instanceof Error && err.message === 'TOKEN_EXPIRED') {
        console.log('토큰 만료로 인한 로그아웃');
        await forceLogout();
      }

      setWeeklyDataList([]);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, forceLogout]);

  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData]);

  return {
    weeklyDataList,
    loading,
    error,
    refetch: fetchWeeklyData,
  };
};
