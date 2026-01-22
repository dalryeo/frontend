import { router } from 'expo-router';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { appleLogin } from '../services/authService';

interface CustomJwtPayload extends JwtPayload {
  nickname?: string;
  name?: string;
  email?: string;
}

export function useAppleLogin() {
  const { login: authLogin } = useAuth();

  const login = async () => {
    try {
      console.log('🍎 Apple 로그인 시작');
      const response = await appleLogin();
      console.log('🍎 응답:', response);

      const { accessToken, refreshToken, isNewUser } = response;

      if (!accessToken || !refreshToken) {
        Alert.alert('로그인 실패', '토큰을 받아오지 못했습니다.');
        return;
      }

      const decoded = jwtDecode<CustomJwtPayload>(accessToken);

      if (!decoded.sub) {
        Alert.alert('로그인 실패', '사용자 정보를 가져올 수 없습니다.');
        return;
      }

      const user = {
        id: decoded.sub,
        nickname: decoded.nickname || decoded.name || undefined,
        email: decoded.email || undefined,
      };

      if (isNewUser) {
        console.log('🆕 새로운 사용자 - startRecord로 이동');
        await authLogin(user, accessToken, refreshToken);
        router.replace('/startRecord');
        return;
      }

      console.log('👤 기존 사용자 - 온보딩 상태 확인');
      const isOnboardingComplete = await authLogin(
        user,
        accessToken,
        refreshToken,
      );

      console.log('✅ 온보딩 완료 여부:', isOnboardingComplete);

      if (isOnboardingComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/profile');
      }
    } catch (error) {
      console.error('❌ Apple login error:', error);

      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'ERR_REQUEST_CANCELED') {
          return;
        }
      }

      if (error instanceof Error && error.message === 'NO_IDENTITY_TOKEN') {
        Alert.alert('로그인 실패', 'Apple identityToken이 없습니다.');
        return;
      }

      Alert.alert('로그인 오류', 'Apple 로그인 중 문제가 발생했습니다.');
    }
  };

  return { login };
}
