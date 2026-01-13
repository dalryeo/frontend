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

export interface TierMyRecord {
  averagePace: string;
  rank: string;
  percentage: string;
}

export interface DistanceMyRecord {
  distance: string;
  rank: string;
  percentage: string;
}

export type MyRecord = TierMyRecord | DistanceMyRecord | null;

export interface MyRecordConfig {
  label: string;
  getValue: (record: MyRecord) => string;
}

export interface RankingConfig {
  title: string;
  detailRoute: string;
  myRecordLabel: string;
}
