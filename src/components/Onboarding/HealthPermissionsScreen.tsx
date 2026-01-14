import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useWorkoutPermissions } from '../../hooks/useWorkoutPermissions';
import { PermissionScreen } from './PermissionScreen';

const HealthPermissionsScreen = () => {
  const { requestHealthPermission, isRequesting, permissions } =
    useWorkoutPermissions();
  const router = useRouter();

  const handleHealthPermission = useCallback(async () => {
    try {
      const result = await requestHealthPermission();
      console.log('Health 권한 요청 결과:', result);
      router.replace('/locationPermission');
    } catch (error) {
      console.error('Health 권한 요청 오류:', error);
      router.replace('/locationPermission');
    }
  }, [requestHealthPermission, router]);

  useEffect(() => {
    if (permissions.healthKit && !isRequesting) {
      router.replace('/locationPermission');
    }
  }, [permissions.healthKit, isRequesting, router]);

  return (
    <PermissionScreen
      title={['Apple 건강 앱과', '동기화할까요?']}
      description={[
        '워치와 iphone의 러닝 데이터를 자동으로 불러와',
        '기록을 놓치지않고 더 정밀한 분석과 티어 산정이 가능해요',
      ]}
      buttonText={isRequesting ? '동기화 권한 요청중...' : '동기화 설정하기'}
      onPress={handleHealthPermission}
    />
  );
};

export { HealthPermissionsScreen };
