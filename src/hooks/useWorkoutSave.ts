import { WorkoutMetrics, workoutModule } from '@/modules/workout';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { recordRecoveryService } from '../services/recordRecoveryService';
import { RecordError, RecordErrorType } from '../services/recordService';
import { RunningRecordService } from '../services/runningRecordService';
import { RecordSaveRequest } from '../types/record';
import { workoutService } from '../services/workoutService';

const askResume = (reason: string): Promise<boolean> =>
  new Promise((resolve) => {
    Alert.alert('기록 이상 감지', `${reason}\n\n러닝을 재개하시겠어요?`, [
      { text: '아니오', style: 'cancel', onPress: () => resolve(false) },
      { text: '예', onPress: () => resolve(true) },
    ]);
  });

export interface FailedSaveInfo {
  errorType: RecordErrorType;
  userMessage: string;
}

export const useWorkoutSave = (
  metrics: WorkoutMetrics,
  startTime: Date | null,
) => {
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  isSavingRef.current = isSaving;
  const hasEndedRef = useRef(false);
  const [failedSaveInfo, setFailedSaveInfo] = useState<FailedSaveInfo | null>(
    null,
  );
  const { showToast } = useToast();
  const { getAccessToken, user } = useAuth();
  const router = useRouter();

  const clearFailedSaveInfo = () => setFailedSaveInfo(null);

  const saveRef = useRef<(allowResume?: boolean) => Promise<void>>(
    async () => {},
  );
  saveRef.current = async (allowResume = true) => {
    if (!startTime || hasEndedRef.current) return;
    hasEndedRef.current = true;
    setIsSaving(true);

    // try 블록 밖에서 선언해 catch에서도 사용 가능하게 함
    let recordData: RecordSaveRequest | null = null;
    let toastMessage = '러닝이 완료되었어요';

    try {
      const prepared = RunningRecordService.prepareRecord(metrics, startTime);
      recordData = prepared.recordData;

      if (prepared.validationError) {
        if (!allowResume) throw new Error('VALIDATION_REJECTED');
        const resume = await askResume(prepared.validationError);
        if (resume) throw new Error('RESUME_WORKOUT');
        throw new Error('VALIDATION_REJECTED');
      }

      const saved = await RunningRecordService.saveToBackend(
        recordData,
        getAccessToken,
      );
      if (saved) {
        Sentry.addBreadcrumb({
          category: 'workout',
          message: '러닝 기록 저장 성공',
          level: 'info',
          data: {
            distanceKm: recordData.distanceKm,
            durationSec: recordData.durationSec,
          },
        });
      } else {
        toastMessage = '러닝이 종료되었어요';
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'RESUME_WORKOUT') {
        hasEndedRef.current = false;
        return;
      }

      if (error instanceof Error && error.message === 'VALIDATION_REJECTED') {
        toastMessage = '러닝이 종료되었어요';
      } else if ((error as RecordError).type) {
        const recordError = error as RecordError;

        Sentry.addBreadcrumb({
          category: 'workout',
          message: '러닝 기록 저장 실패',
          level: 'error',
          data: {
            errorType: recordError.type,
            distanceKm: recordData?.distanceKm,
            durationSec: recordData?.durationSec,
          },
        });

        if (recordData) {
          try {
            await recordRecoveryService.saveFailedRecord(
              recordData,
              recordError.type,
              recordError.userMessage,
            );
          } catch {}
        }

        Sentry.captureException(error, {
          user: { id: String(user?.id ?? 'unknown') },
          contexts: {
            record: {
              ...recordData,
              errorType: recordError.type,
              errorMessage: recordError.message,
              userMessage: recordError.userMessage,
            },
            app: { app_version: Constants.expoConfig?.version ?? '0.0.0' },
            os: { name: Platform.OS, version: String(Platform.Version) },
          },
          tags: {
            errorType: recordError.type,
            appVersion: Constants.expoConfig?.version ?? '0.0.0',
          },
        });

        try {
          if (allowResume) await workoutService.end();
          await workoutModule.reset();
        } catch {}

        setFailedSaveInfo({
          errorType: recordError.type,
          userMessage: recordError.userMessage,
        });
        return;
      } else {
        const genericUserMessage =
          '기록 저장 중 알 수 없는 오류가 발생했습니다.';

        if (recordData) {
          try {
            await recordRecoveryService.saveFailedRecord(
              recordData,
              'UNKNOWN_ERROR',
              genericUserMessage,
            );
          } catch {}
        }

        Sentry.captureException(error, {
          contexts: { user: user ? { userId: user.id } : {} },
        });

        try {
          if (allowResume) await workoutService.end();
          await workoutModule.reset();
        } catch {}

        setFailedSaveInfo({
          errorType: 'UNKNOWN_ERROR',
          userMessage: genericUserMessage,
        });
        return;
      }
    } finally {
      setIsSaving(false);
    }

    // 성공 및 VALIDATION_REJECTED 경로만 여기까지 도달
    try {
      if (allowResume) await workoutService.end();
      await workoutModule.reset();
    } catch {}
    showToast(toastMessage);
    router.replace('/analysis');
  };

  return {
    isSaving,
    isSavingRef,
    saveRef,
    failedSaveInfo,
    clearFailedSaveInfo,
  };
};
