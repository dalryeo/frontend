import { RecordSaveRequest } from '../types/record';
import { formatLocalDateTime } from './dateUtils';

interface RunningMetrics {
  distance: number;
  elapsedTime: number;
  pace?: number;
  heartRate?: number;
}

// 페이스 계산
export const calculatePace = (
  metricPace: number | undefined,
  distanceKm: number,
  elapsedTime: number,
): number => {
  if (metricPace && metricPace > 0 && !isNaN(metricPace)) {
    return Math.round(metricPace * 60);
  } else if (distanceKm > 0 && elapsedTime > 0) {
    return Math.round(elapsedTime / distanceKm);
  } else {
    return 360;
  }
};

// km당 페이스 계산
export const calculatePaceSecPerKm = (
  hours: number,
  minutes: number,
  seconds: number,
  distance: number,
): number => {
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return Math.round(totalSeconds / distance);
};

// 칼로리 계산
export const calculateCalories = (distanceKm: number): number => {
  return Math.max(1, Math.round(distanceKm * 70 * 1.036));
};

export const validateRunningRecord = (
  record: RecordSaveRequest,
): string | null => {
  if (!record.platform) return '플랫폼 정보가 없습니다.';
  if (record.distanceKm == null || record.distanceKm < 0.1)
    return `거리가 너무 짧습니다. (${record.distanceKm}km)`;
  if (record.distanceKm > 100)
    return `거리가 너무 깁니다. (${record.distanceKm}km)`;
  if (record.durationSec < 60)
    return `운동 시간이 너무 짧습니다. (${record.durationSec}초)`;
  if (record.durationSec > 43200)
    return `운동 시간이 너무 깁니다. (${Math.round(record.durationSec / 3600)}시간)`;
  if (record.avgPaceSecPerKm < 120)
    return `페이스가 너무 빠릅니다. (${record.avgPaceSecPerKm}초/km)`;
  if (record.avgPaceSecPerKm > 3600)
    return `페이스가 너무 느립니다. (${record.avgPaceSecPerKm}초/km)`;
  if (record.avgHeartRate !== null && record.avgHeartRate < 30)
    return `심박수가 너무 낮습니다. (${record.avgHeartRate}bpm)`;
  if (record.avgHeartRate !== null && record.avgHeartRate > 240)
    return `심박수가 너무 높습니다. (${record.avgHeartRate}bpm)`;
  if (record.caloriesKcal < 1)
    return `칼로리가 너무 낮습니다. (${record.caloriesKcal}kcal)`;
  if (record.caloriesKcal > 10000)
    return `칼로리가 너무 높습니다. (${record.caloriesKcal}kcal)`;
  if (!record.startAt || !record.endAt)
    return '시작/종료 시간 정보가 없습니다.';

  const startMs = new Date(record.startAt).getTime();
  const endMs = new Date(record.endAt).getTime();
  const now = Date.now();

  if (isNaN(startMs) || isNaN(endMs))
    return '시작/종료 시간 형식이 잘못되었습니다.';
  if (endMs <= startMs) return '종료 시간이 시작 시간보다 빠릅니다.';
  if (startMs > now || endMs > now)
    return '기록 시간이 현재 시각보다 미래입니다.';

  const wallClockSec = (endMs - startMs) / 1000;
  if (Math.abs(wallClockSec - record.durationSec) > 120)
    return `운동 시간과 기록 시간이 일치하지 않습니다. (시간: ${Math.round(wallClockSec)}초, 기록: ${record.durationSec}초)`;

  const calculatedPace = record.durationSec / record.distanceKm;
  if (Math.abs(calculatedPace - record.avgPaceSecPerKm) > 60)
    return '페이스와 운동 데이터가 일치하지 않습니다.';

  return null;
};

// 운동 기록 데이터 생성
export const createRecordData = (
  metrics: RunningMetrics,
  startTime: Date,
  endTime: Date,
) => {
  const distanceKm = parseFloat(
    Math.max(0.1, metrics.distance / 1000).toFixed(2),
  );
  const durationSec = Math.max(1, Math.round(metrics.elapsedTime));
  const avgPaceSecPerKm = Math.min(
    3600,
    Math.max(60, Math.round(durationSec / distanceKm)),
  );

  return {
    platform: 'IOS' as const,
    distanceKm,
    durationSec,
    avgPaceSecPerKm,
    avgHeartRate: metrics.heartRate ? Math.round(metrics.heartRate) : null,
    caloriesKcal: calculateCalories(distanceKm),
    startAt: formatLocalDateTime(startTime),
    endAt: formatLocalDateTime(endTime),
  };
};
