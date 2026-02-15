export interface AnalysisRecord {
  recordId: number;
  date: string;
  distanceKm: number;
  durationSec: number;
  avgPaceSecPerKm: number;
  bpm: number;
  caloriesKcal?: number;
  tierCode?: string;
  startAt?: string;
  endAt?: string;
}

export type PeriodType = 'weekly' | 'monthly' | 'yearly';
export type SortType = 'latest' | 'pace' | 'distance';

export interface AnalysisRecordsData {
  total: number;
  records: AnalysisRecord[];
}

export interface AnalysisRecordsResponse {
  success: boolean;
  data: AnalysisRecordsData | { code: string; message: string };
}

export interface AnalysisRecordsParams {
  page?: number;
  sort?: SortType;
  period?: PeriodType;
}
