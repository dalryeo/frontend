import { RANKING_ROUTES } from '../constants/RankingRoutes';
import {
  DistanceMyRecord,
  MyRecord,
  RankingConfig,
  RankingType,
  TierMyRecord,
} from '../types/ranking.types';
import { formatPace } from './formatUtils';

interface RankingApiData {
  rank: number;
  nickname: string;
  weeklyAvgPace: number;
  weeklyDistance: number;
}

interface MyRankingApiData {
  scoreRank?: number;
  distanceRank?: number;
  weeklyAvgPace: number;
  weeklyDistance: number;
}

export function getRankingConfig(type: RankingType): RankingConfig {
  const configs: Record<RankingType, RankingConfig> = {
    tier: {
      title: '주간 티어 랭킹',
      detailRoute: `${RANKING_ROUTES.DETAIL}?type=tier`,
      myRecordLabel: '평균 페이스',
    },
    distance: {
      title: '주간 거리 랭킹',
      detailRoute: `${RANKING_ROUTES.DETAIL}?type=distance`,
      myRecordLabel: '거리',
    },
  };

  return configs[type];
}

export function getMyRecordValue(type: RankingType, record: MyRecord): string {
  if (!record) return '-';

  if (type === 'tier') {
    return (record as TierMyRecord).averagePace || '-';
  }

  return (record as DistanceMyRecord).distance || '-';
}

export function transformScoreRankingToItems(apiData: RankingApiData[]) {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((item) => ({
    rank: item.rank || 0,
    isFirst: item.rank === 1,
    nickname: item.nickname || '알 수 없음',
    time: formatPace(item.weeklyAvgPace),
    distance: `${item.weeklyDistance || 0}km`,
  }));
}

export function transformDistanceRankingToItems(apiData: RankingApiData[]) {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((item) => ({
    rank: item.rank || 0,
    isFirst: item.rank === 1,
    nickname: item.nickname || '알 수 없음',
    time: formatPace(item.weeklyAvgPace),
    distance: `${item.weeklyDistance || 0}km`,
  }));
}

export function transformMyRankingToRecord(
  apiData: MyRankingApiData,
  type: 'tier' | 'distance',
) {
  if (!apiData) return null;

  if (type === 'tier') {
    const scoreRank = apiData.scoreRank;
    if (scoreRank === undefined || scoreRank === null) return null;

    return {
      averagePace: formatPace(apiData.weeklyAvgPace),
      rank: `${scoreRank.toString()}위`,
      percentage: `${Math.round((scoreRank / 100) * 100)}%`,
    };
  } else {
    const distanceRank = apiData.distanceRank;
    if (distanceRank === undefined || distanceRank === null) return null;

    return {
      distance: `${apiData.weeklyDistance || 0}km`,
      rank: `${distanceRank.toString()}위`,
      percentage: `${Math.round((distanceRank / 100) * 100)}%`,
    };
  }
}

export function transformToRankingListItems(apiData: RankingApiData[]) {
  if (!apiData || !Array.isArray(apiData)) return [];

  return apiData.map((item) => ({
    rank: item.rank || 0,
    nickname: item.nickname || '알 수 없음',
    time: formatPace(item.weeklyAvgPace),
    distance: `${item.weeklyDistance || 0}km`,
  }));
}
