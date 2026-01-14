import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useWorkoutPermissions } from '../../hooks/useWorkoutPermissions';
import { PermissionScreen } from './PermissionScreen';

const LocationPermissionScreen = () => {
  const { requestLocationPermission, isRequesting, permissions } =
    useWorkoutPermissions();
  const router = useRouter();

  const handleLocationPermission = useCallback(async () => {
    try {
      const result = await requestLocationPermission();
      console.log('Location 권한 요청 결과:', result);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Location 권한 요청 오류:', error);
      router.replace('/(tabs)');
    }
  }, [requestLocationPermission, router]);

  useEffect(() => {
    if (permissions.location && !isRequesting) {
      router.replace('/(tabs)');
    }
  }, [permissions.location, isRequesting, router]);

  return (
    <PermissionScreen
      title={['티어 측정을 위해', '위치권한이 필요해요']}
      description={[
        '달려는 러닝 기록을 기반으로 티어를 계산해요',
        '원활한 서비스 이용을 위해 위치 권한을 허용해주세요',
      ]}
      buttonText={isRequesting ? 'GPS 권한 요청중...' : '권한 설정하기'}
      onPress={handleLocationPermission}
    />
  );
};

export { LocationPermissionScreen };
