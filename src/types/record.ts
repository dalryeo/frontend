export interface WeeklyRecordSummary {
  currentTier: string;
  currentTierGrade: string;
  weeklyCount: number;
  weeklyAvgPace: number;
  weeklyDistance: number;
}

export interface WeeklyRecordResponse {
  success: boolean;
  data: WeeklyRecordSummary | { code: string; message: string };
}

export interface RecordSaveRequest {
  platform: 'IOS' | 'ANDROID';
  distanceKm: number;
  durationSec: number;
  avgPaceSecPerKm: number;
  avgHeartRate: number;
  caloriesKcal: number;
  startAt: string;
  endAt: string;
}

export interface RecordSaveResponse {
  success: true;
  data: {
    recordId: number;
  };
}
