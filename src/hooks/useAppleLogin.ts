import { router } from 'expo-router';
import { Alert } from 'react-native';
import { appleLogin } from '../services/authService';

export function useAppleLogin() {
  const login = async () => {
    try {
      const { accessToken, refreshToken, isNewUser } = await appleLogin();

      console.log('accessToken:', accessToken);
      console.log('refreshToken:', refreshToken);

      if (isNewUser) {
        router.replace('/profile');
      } else {
        router.replace('/mainScreen');
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 'ERR_REQUEST_CANCELED') {
          return;
        }
      }

      if (error instanceof Error && error.message === 'NO_IDENTITY_TOKEN') {
        Alert.alert('로그인 실패', 'Apple 인증 정보를 가져오지 못했습니다.');
        return;
      }

      Alert.alert('로그인 오류', 'Apple 로그인 중 문제가 발생했습니다.');
      console.error(error);
    }
  };

  return { login };
}
