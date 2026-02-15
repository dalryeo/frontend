export type RankingType = 'tier' | 'distance';

export interface RankingItem {
  rank: number;
  isFirst: boolean;
  nickname: string;
  time: string;
  distance: string;
}

export interface RankingListItem {
  rank: number;
  nickname: string;
  time: string;
  distance: string;
}

export interface ScoreRankingItem {
  rank: number;
  nickname: string;
  weeklyAvgPace: number;
  weeklyDistance: number;
}

export interface DistanceRankingItem {
  rank: number;
  nickname: string;
  weeklyAvgPace: number;
  weeklyDistance: number;
}

export interface TierMyRecord {
  averagePace: string;
  percentage: string;
  rank?: string;
}

export interface DistanceMyRecord {
  distance: string;
  percentage: string;
  rank?: string;
}

export type MyRecord = TierMyRecord | DistanceMyRecord | null;

export interface MyRankingData {
  scoreRank?: number;
  distanceRank?: number;
  weeklyAvgPace: number;
  weeklyDistance: number;
}

export interface MyRecordConfig {
  label: string;
  getValue: (record: MyRecord) => string;
}

export interface RankingConfig {
  title: string;
  detailRoute: string;
  myRecordLabel: string;
}
