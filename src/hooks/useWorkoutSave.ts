import { WorkoutMetrics, workoutModule } from '@/modules/workout';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
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
  const { getAccessToken } = useAuth();
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
      toastMessage =
        error instanceof Error && error.message === 'VALIDATION_REJECTED'
          ? '러닝이 종료되었어요'
          : '저장에 실패했어요';
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
