import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useWorkoutPermissions } from '../../hooks/useWorkoutPermissions';
import { PermissionScreen } from './PermissionScreen';

const LocationPermissionScreen = () => {
  const { requestLocationPermission, isRequesting, permissions } =
    useWorkoutPermissions();
  const router = useRouter();
  const [attempted, setAttempted] = useState(false);

  const handleLocationPermission = useCallback(async () => {
    setAttempted(true);
    try {
      const result = await requestLocationPermission();
      if (result.location) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Location 권한 요청 오류:', error);
    }
  }, [requestLocationPermission, router]);

  // 버튼을 누른 후에만 auto-navigate (설정 앱에서 돌아온 경우도 처리)
  useEffect(() => {
    if (attempted && permissions.location && !isRequesting) {
      router.replace('/(tabs)');
    }
  }, [attempted, permissions.location, isRequesting, router]);

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
