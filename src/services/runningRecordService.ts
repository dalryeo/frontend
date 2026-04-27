import { RecordSaveRequest } from '../types/record';
import {
  createRecordData,
  validateRunningRecord,
} from '../utils/calculationUtils';
import { recordService } from './recordService';

interface RunningMetrics {
  distance: number;
  elapsedTime: number;
  pace?: number;
  heartRate?: number;
}

export class RunningRecordService {
  static prepareRecord(
    metrics: RunningMetrics,
    startTime: Date,
  ): { recordData: RecordSaveRequest; validationError: string | null } {
    const endTime = new Date();
    const effectiveElapsedSec =
      metrics.elapsedTime > 0
        ? metrics.elapsedTime
        : (endTime.getTime() - startTime.getTime()) / 1000;
    const durationSec = Math.max(1, Math.round(effectiveElapsedSec));
    const computedStartTime = new Date(endTime.getTime() - durationSec * 1000);
    const effectiveMetrics = { ...metrics, elapsedTime: effectiveElapsedSec };
    const recordData = createRecordData(
      effectiveMetrics,
      computedStartTime,
      endTime,
    );
    const validationError = validateRunningRecord(recordData);
    return { recordData, validationError };
  }

  static async saveToBackend(
    recordData: RecordSaveRequest,
    getAccessToken: () => Promise<string | null>,
  ): Promise<boolean> {
    const token = await getAccessToken();
    if (!token) return false;
    await recordService.saveRecord(recordData, token);
    return true;
  }
}
