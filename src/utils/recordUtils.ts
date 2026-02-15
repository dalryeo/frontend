import { AnalysisRecord } from '../services/analysisService';
import { PeriodType } from '../types/analysis.types';
import { formatDateString, getDateRange } from './dateUtils';
import { formatDistance, formatDuration, formatPace } from './formatUtils';

export interface ProcessedRecord {
  id: string;
  date: string;
  pace: string;
  distance: string;
  duration: string;
  heartRate: number;
  originalDate: Date;
}

// API 데이터를 UI 형태로 변환
export const processRecord = (record: AnalysisRecord): ProcessedRecord => {
  const originalDate = new Date(record.date);

  return {
    id: record.recordId.toString(),
    date: formatDateString(record.date),
    pace: formatPace(record.avgPaceSecPerKm),
    distance: formatDistance(record.distanceKm),
    duration: formatDuration(record.durationSec),
    heartRate: record.bpm || 0,
    originalDate,
  };
};

// 기간별 필터링
export function filterRecordsByPeriod(
  records: ProcessedRecord[],
  period: PeriodType,
): ProcessedRecord[] {
  const dateRange = getDateRange(period);

  const filteredRecords = records.filter((record) => {
    const recordDate = record.originalDate;
    const isInRange =
      recordDate >= dateRange.start && recordDate <= dateRange.end;
    return isInRange;
  });

  return filteredRecords;
}

// 날짜별 그룹화
export const groupRecordsByDate = (
  records: ProcessedRecord[],
): [string, ProcessedRecord[]][] => {
  const grouped: { [key: string]: ProcessedRecord[] } = {};

  records.forEach((record) => {
    if (!grouped[record.date]) {
      grouped[record.date] = [];
    }
    grouped[record.date].push(record);
  });

  return Object.entries(grouped).sort((a, b) => {
    const dateA = new Date(a[1][0].originalDate);
    const dateB = new Date(b[1][0].originalDate);
    return dateB.getTime() - dateA.getTime();
  });
};

// 정렬 함수
export const sortRecords = (
  records: AnalysisRecord[],
  sort: 'latest' | 'pace' | 'distance',
): AnalysisRecord[] => {
  const sorted = [...records];

  switch (sort) {
    case 'latest':
      sorted.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      break;
    case 'pace':
      sorted.sort((a, b) => a.avgPaceSecPerKm - b.avgPaceSecPerKm);
      break;
    case 'distance':
      sorted.sort((a, b) => b.distanceKm - a.distanceKm);
      break;
  }

  return sorted;
};
