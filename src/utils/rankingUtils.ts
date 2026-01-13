import { RANKING_ROUTES } from '../constants/RankingRoutes';
import {
  DistanceMyRecord,
  MyRecord,
  RankingConfig,
  RankingType,
  TierMyRecord,
} from '../types/ranking.types';

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

export function isMultiLineNickname(
  nickname: string,
  maxLength: number = 6,
): boolean {
  const cleanNickname = nickname.replace(/\s/g, '');
  return cleanNickname.length > maxLength;
}
