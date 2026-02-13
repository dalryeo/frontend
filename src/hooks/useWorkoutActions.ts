import { workoutModule } from '@/modules/workout';
import { Alert } from 'react-native';

export const useWorkoutActions = () => {
  const handleStart = async (
    hasAllPermissions: boolean,
    requestPermissions: () => void,
    onSuccess: () => void,
  ) => {
    if (!hasAllPermissions) {
      Alert.alert(
        '권한 필요',
        '운동 기록을 위해 Health와 위치 권한이 필요합니다.',
        [
          {
            text: '권한 허용',
            onPress: requestPermissions,
          },
          { text: '취소', style: 'cancel' },
        ],
      );
      return;
    }

    try {
      const result = await workoutModule.start();
      if (!result.success) {
        Alert.alert('오류', result.error.message);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('워크아웃 시작 오류:', error);
      Alert.alert('오류', '워크아웃을 시작할 수 없습니다.');
    }
  };

  const handlePause = async () => {
    try {
      const result = await workoutModule.pause();
      if (!result.success) {
        Alert.alert('오류', result.error.message);
      }
    } catch (error) {
      console.error('워크아웃 일시정지 오류:', error);
    }
  };

  const handleResume = async (onSuccess: () => void) => {
    try {
      const result = await workoutModule.resume();
      if (!result.success) {
        Alert.alert('오류', result.error.message);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('워크아웃 재개 오류:', error);
    }
  };

  const handleEnd = async () => {
    try {
      const result = await workoutModule.end();
      if (!result.success) {
        if (result.error.message.includes('진행 중인 운동이 없습니다')) {
          return true;
        }

        console.error('워크아웃 종료 실패:', result.error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('워크아웃 종료 중 예외 발생:', error);
      return false;
    }
  };

  const checkWorkoutStatus = async () => {
    try {
      if (
        workoutModule &&
        'getStatus' in workoutModule &&
        typeof workoutModule.getStatus === 'function'
      ) {
        const status = await workoutModule.getStatus();
        return status;
      }
      console.log('getStatus 메서드를 찾을 수 없습니다.');
      return null;
    } catch (error) {
      console.error('워크아웃 상태 확인 오류:', error);
      return null;
    }
  };

  const safeEnd = async () => {
    try {
      const status = await checkWorkoutStatus();

      if (status?.isActive || status?.isRunning) {
        return await handleEnd();
      } else {
        return true;
      }
    } catch (error) {
      console.error('안전한 종료 처리 중 오류:', error);
      return false;
    }
  };

  return {
    handleStart,
    handlePause,
    handleResume,
    handleEnd,
    safeEnd,
    checkWorkoutStatus,
  };
};
