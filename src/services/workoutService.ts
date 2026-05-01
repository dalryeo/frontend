import { workoutModule } from '@/modules/workout';
import { Alert, Linking } from 'react-native';

export const workoutService = {
  async start(
    hasAllPermissions: boolean,
    requestPermissions: () => void,
    onSuccess: () => void,
  ): Promise<void> {
    if (!hasAllPermissions) {
      Alert.alert(
        '권한 필요',
        '운동 기록을 위해 Health와 위치 권한이 필요합니다.',
        [
          { text: '권한 허용', onPress: requestPermissions },
          { text: '취소', style: 'cancel' },
        ],
      );
      return;
    }
    try {
      const result = await workoutModule.start();
      if (!result.success) {
        if (result.error.code === 'workoutAlreadyInProgress') {
          onSuccess();
          return;
        }
        if (result.error.message.includes('위치 접근 권한')) {
          Alert.alert(
            '위치 권한이 필요해요',
            '설정에서 위치 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              { text: '설정 열기', onPress: () => Linking.openSettings() },
            ],
          );
          return;
        }
        Alert.alert('오류', result.error.message);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('워크아웃 시작 오류:', error);
      Alert.alert('오류', '워크아웃을 시작할 수 없습니다.');
    }
  },

  async pause(): Promise<void> {
    try {
      const result = await workoutModule.pause();
      if (!result.success) {
        Alert.alert('오류', result.error.message);
      }
    } catch (error) {
      console.error('워크아웃 일시정지 오류:', error);
    }
  },

  async resume(onSuccess: () => void): Promise<void> {
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
  },

  async end(): Promise<boolean> {
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
  },
};
