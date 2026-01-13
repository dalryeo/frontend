import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { NEUTRAL } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAppFonts } from '../../hooks/useAppFonts';
import { appleLogin } from '../../services/authService';
import { Font } from '../Font';

function Login() {
  const [fontsLoaded] = useAppFonts();
  const { setUser } = useAuth();

  if (!fontsLoaded) return null;

  const handleAppleLogin = async () => {
    try {
      const { user, isNewUser } = await appleLogin();

      setUser(user);

      router.replace(isNewUser ? '/profile' : '/mainScreen');
    } catch (error) {
      if (error instanceof Error && error.message === 'NO_IDENTITY_TOKEN') {
        Alert.alert('로그인 실패', 'Apple identityToken이 없습니다.');
        return;
      }

      Alert.alert('로그인 오류', 'Apple 로그인 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.buttonContainer} onPress={handleAppleLogin}>
        <AntDesign
          name='apple'
          size={24}
          color={NEUTRAL.BLACK}
          style={styles.appleIcon}
        />
        <Font type='MainButton' style={styles.buttonText}>
          Apple로 시작하기
        </Font>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    left: 15,
    right: 15,
    height: 64,
    borderRadius: 15,
    backgroundColor: NEUTRAL.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleIcon: {
    position: 'absolute',
    left: 25,
  },
  buttonText: {
    color: NEUTRAL.BLACK,
  },
});

export { Login };
