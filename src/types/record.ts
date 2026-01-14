export interface WeeklyRecordSummary {
  currentTier: string;
  currentTierGrade: string;
  weeklyCount: number;
  weeklyAvgPace: number;
  weeklyDistance: number;
  code?: string;
  message?: string;
}

export interface WeeklyRecordResponse {
  success: boolean;
  data: WeeklyRecordSummary | { code: string; message: string };
}
