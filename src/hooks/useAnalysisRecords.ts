import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  AnalysisRecord,
  getAnalysisRecords,
} from '../services/analysisService';

export type SortType = 'latest' | 'pace' | 'distance';

export const useAnalysisRecords = () => {
  const { getAccessToken } = useAuth();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchRecords = useCallback(
    async (page: number = 1, sort: SortType = 'latest') => {
      setLoading(true);
      setError(null);

      try {
        const token = await getAccessToken();

        if (!token) {
          setRecords([]);
          setTotal(0);
          return;
        }

        const result = await getAnalysisRecords(page, sort, token);

        setRecords(result.data.records);
        setTotal(result.data.total);
      } catch (err) {
        console.error('분석 기록 조회 실패:', err);
        setRecords([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [getAccessToken],
  );

  const changeSort = useCallback(
    (newSort: SortType) => {
      fetchRecords(1, newSort);
    },
    [fetchRecords],
  );

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    error,
    total,
    fetchRecords,
    changeSort,
  };
};

export type { AnalysisRecord };
