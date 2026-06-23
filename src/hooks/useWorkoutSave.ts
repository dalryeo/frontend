import { WorkoutMetrics, workoutModule } from '@/modules/workout';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { recordRecoveryService } from '../services/recordRecoveryService';
import { RecordError } from '../services/recordService';
import { RunningRecordService } from '../services/runningRecordService';
import { workoutService } from '../services/workoutService';

const askResume = (reason: string): Promise<boolean> =>
  new Promise((resolve) => {
    Alert.alert('기록 이상 감지', `${reason}\n\n러닝을 재개하시겠어요?`, [
      { text: '아니오', style: 'cancel', onPress: () => resolve(false) },
      { text: '예', onPress: () => resolve(true) },
    ]);
  });

export const useWorkoutSave = (
  metrics: WorkoutMetrics,
  startTime: Date | null,
) => {
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);
  isSavingRef.current = isSaving;
  const hasEndedRef = useRef(false);
  const { showToast } = useToast();
  const { getAccessToken, user } = useAuth();
  const router = useRouter();

  const saveRef = useRef<(allowResume?: boolean) => Promise<void>>(
    async () => {},
  );
  saveRef.current = async (allowResume = true) => {
    if (!startTime || hasEndedRef.current) return;
    hasEndedRef.current = true;
    setIsSaving(true);
    let toastMessage = '러닝이 완료되었어요';
    try {
      const { recordData, validationError } =
        RunningRecordService.prepareRecord(metrics, startTime);
      if (validationError) {
        if (!allowResume) throw new Error('VALIDATION_REJECTED');
        const resume = await askResume(validationError);
        if (resume) throw new Error('RESUME_WORKOUT');
        throw new Error('VALIDATION_REJECTED');
      }
      const saved = await RunningRecordService.saveToBackend(
        recordData,
        getAccessToken,
      );
      if (!saved) toastMessage = '러닝이 종료되었어요';
    } catch (error) {
      if (error instanceof Error && error.message === 'RESUME_WORKOUT') {
        hasEndedRef.current = false;
        return;
      }

      if (error instanceof Error && error.message === 'VALIDATION_REJECTED') {
        toastMessage = '러닝이 종료되었어요';
      } else if ((error as RecordError).type) {
        const recordError = error as RecordError;
        toastMessage = recordError.userMessage;

        const { recordData } = RunningRecordService.prepareRecord(
          metrics,
          startTime,
        );

        // 실패한 기록 로컬 저장
        await recordRecoveryService.saveFailedRecord(
          recordData,
          recordError.type,
          recordError.userMessage,
        );

        // Sentry로 에러 전송
        Sentry.captureException(error, {
          user: {
            id: String(user?.id ?? 'unknown'),
          },
          contexts: {
            record: {
              ...recordData,
              errorType: recordError.type,
              errorMessage: recordError.message,
              userMessage: recordError.userMessage,
            },
            app: {
              app_version: Constants.expoConfig?.version ?? '0.0.0',
            },
            os: {
              name: Platform.OS,
              version: String(Platform.Version),
            },
          },
          tags: {
            errorType: recordError.type,
            appVersion: Constants.expoConfig?.version ?? '0.0.0',
          },
        });

        showToast(
          '기록을 안전하게 보관했습니다. 저장 기록에서 다시 시도해주세요.',
        );
        return;
      } else {
        toastMessage = '저장에 실패했어요';
        Sentry.captureException(error, {
          contexts: {
            user: user ? { userId: user.id } : {},
          },
        });
      }
    } finally {
      setIsSaving(false);
    }
    try {
      if (allowResume) await workoutService.end();
      await workoutModule.reset();
    } catch {}
    showToast(toastMessage);
    router.replace('/analysis');
  };

  return { isSaving, isSavingRef, saveRef };
};
