import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchDistanceRanking,
  fetchMyRanking as fetchMyRankingService,
  fetchScoreRanking,
} from '../services/rankingService';
import {
  DistanceRankingItem,
  MyRankingData,
  ScoreRankingItem,
} from '../types/ranking.types';

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

export function useScoreRanking() {
  const [rankings, setRankings] = useState<ScoreRankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { forceLogout } = useAuth();

  const fetchRanking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchScoreRanking();

      if (response.success && response.data) {
        if (hasErrorCode(response.data)) {
          if (response.data.code === 'AC-006') {
            await forceLogout();
          }
          setRankings([]);
        } else if (Array.isArray(response.data)) {
          setRankings(response.data as ScoreRankingItem[]);
        } else {
          setRankings([]);
        }
      } else {
        setRankings([]);
      }
    } catch (err) {
      setRankings([]);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, [forceLogout]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return {
    rankings,
    isLoading,
    error,
    refetch: fetchRanking,
  };
}

export function useDistanceRanking() {
  const [rankings, setRankings] = useState<DistanceRankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { forceLogout } = useAuth();

  const fetchRanking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchDistanceRanking();

      if (response.success && response.data) {
        if (hasErrorCode(response.data)) {
          if (response.data.code === 'AC-006') {
            await forceLogout();
          }
          setRankings([]);
        } else if (Array.isArray(response.data)) {
          setRankings(response.data as DistanceRankingItem[]);
        } else {
          setRankings([]);
        }
      } else {
        setRankings([]);
      }
    } catch (err) {
      setRankings([]);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, [forceLogout]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return {
    rankings,
    isLoading,
    error,
    refetch: fetchRanking,
  };
}

export function useMyRanking() {
  const [myRanking, setMyRanking] = useState<MyRankingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessToken, forceLogout } = useAuth();

  const fetchMyRanking = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getAccessToken();

      if (!token) {
        setMyRanking(null);
        return;
      }

      const response = await fetchMyRankingService(token);

      if (response.success && response.data) {
        if (hasErrorCode(response.data)) {
          if (response.data.code === 'AC-006') {
            await forceLogout();
          }
          setMyRanking(null);
        } else {
          setMyRanking(response.data as MyRankingData);
        }
      } else {
        setMyRanking(null);
      }
    } catch (err) {
      setMyRanking(null);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, forceLogout]);

  useEffect(() => {
    fetchMyRanking();
  }, [fetchMyRanking]);

  return {
    myRanking,
    isLoading,
    error,
    refetch: fetchMyRanking,
  };
}

export function useRankingData() {
  const scoreRanking = useScoreRanking();
  const distanceRanking = useDistanceRanking();
  const myRanking = useMyRanking();

  const isLoading =
    scoreRanking.isLoading || distanceRanking.isLoading || myRanking.isLoading;
  const hasError =
    scoreRanking.error || distanceRanking.error || myRanking.error;
  const hasData =
    scoreRanking.rankings.length > 0 || distanceRanking.rankings.length > 0;

  const refetchAll = useCallback(async () => {
    await Promise.all([
      scoreRanking.refetch(),
      distanceRanking.refetch(),
      myRanking.refetch(),
    ]);
  }, [scoreRanking, distanceRanking, myRanking]);

  return {
    scoreRankings: scoreRanking.rankings,
    distanceRankings: distanceRanking.rankings,
    myRanking: myRanking.myRanking,
    isLoading,
    hasError,
    hasData,
    refetchAll,
  };
}
