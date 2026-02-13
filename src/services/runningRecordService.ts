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

    if (metrics.elapsedTime < 10) {
      Alert.alert('기록 부족', '최소 10초 이상 운동해야 기록이 저장됩니다.');
      return false;
    }

    try {
      const endTime = new Date();
      const recordData = createRecordData(metrics, startTime, endTime);

      const token = await getAccessToken();
      if (!token) {
        Alert.alert(
          '토큰 오류',
          '로그인 토큰이 없습니다. 다시 로그인해주세요.',
        );
        return false;
      }

      await recordService.saveRecord(recordData, token);

      return true;
    } catch (error) {
      console.error('러닝 기록 저장 실패:', error);
      return false;
    }
  }
}
