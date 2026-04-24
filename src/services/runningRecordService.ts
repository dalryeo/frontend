import { Alert } from 'react-native';
import { createRecordData } from '../utils/calculationUtils';
import { recordService } from './recordService';

interface RunningMetrics {
  distance: number;
  elapsedTime: number;
}

export class RunningRecordService {
  static async saveRecord(
    metrics: RunningMetrics,
    startTime: Date,
    getAccessToken: () => Promise<string | null>,
  ): Promise<boolean> {
    if (!startTime) {
      return false;
    }

    // Watch 종료 시 disconnect → performReset으로 elapsedTime이 0이 될 수 있으므로
    // startTime 기반 wall-clock을 폴백으로 사용
    const endTime = new Date();
    const effectiveElapsedSec =
      metrics.elapsedTime > 0
        ? metrics.elapsedTime
        : (endTime.getTime() - startTime.getTime()) / 1000;

    if (effectiveElapsedSec < 10) {
      Alert.alert('기록 부족', '최소 10초 이상 운동해야 기록이 저장됩니다.');
      return false;
    }

    try {
      const durationSec = Math.max(1, Math.round(effectiveElapsedSec));
      const computedStartTime = new Date(
        endTime.getTime() - durationSec * 1000,
      );
      const effectiveMetrics = { ...metrics, elapsedTime: effectiveElapsedSec };
      const recordData = createRecordData(
        effectiveMetrics,
        computedStartTime,
        endTime,
      );

      const token = await getAccessToken();
      if (!token) {
        return false;
      }

      await recordService.saveRecord(recordData, token);

      return true;
    } catch (error) {
      throw error;
    }
  }
}
