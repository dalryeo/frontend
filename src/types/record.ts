export interface WeeklyRecordSummary {
  weeklyCount: number;
  weeklyAvgPace: number;
  weeklyDistance: number;
  currentTier: string;
  currentTierGrade: string;
}

export interface WeeklyRecordResponse {
  success: boolean;
  data: WeeklyRecordSummary;
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
