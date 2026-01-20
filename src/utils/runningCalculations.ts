import { formatDateForAPI } from './formatters';

interface RunningMetrics {
  distance: number;
  elapsedTime: number;
  pace?: number;
  heartRate?: number;
}

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

export const calculateCalories = (distanceKm: number): number => {
  return Math.max(1, Math.round(distanceKm * 70 * 1.036));
};

export const createRecordData = (
  metrics: RunningMetrics,
  startTime: Date,
  endTime: Date,
) => {
  const distanceKm = Math.max(0.01, metrics.distance / 1000);
  const avgPaceSecPerKm = calculatePace(
    metrics.pace,
    distanceKm,
    metrics.elapsedTime,
  );

  return {
    platform: 'IOS' as const,
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    durationSec: Math.max(1, Math.round(metrics.elapsedTime)),
    avgPaceSecPerKm: Math.max(60, avgPaceSecPerKm),
    avgHeartRate: metrics.heartRate ? Math.round(metrics.heartRate) : 0,
    caloriesKcal: calculateCalories(distanceKm),
    startAt: formatDateForAPI(startTime),
    endAt: formatDateForAPI(endTime),
  };
};
