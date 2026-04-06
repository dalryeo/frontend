import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { IMAGES } from '@/src/constants/Images';
import { NEUTRAL } from '../../constants/Colors';
import { useAppFonts } from '../../hooks/useAppFonts';
import { useAppleLogin } from '../../hooks/useAppleLogin';
import { Font } from '../Font';

function Login() {
  const [fontsLoaded] = useAppFonts();
  const { login } = useAppleLogin();
  const [isLogging, setIsLogging] = useState(false);

  if (!fontsLoaded) return null;

  const handleLogin = async () => {
    if (isLogging) return;

    setIsLogging(true);
    try {
      await login();
    } catch (error) {
      console.error('로그인 실패:', error);
      setIsLogging(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Image source={IMAGES.APP.LOGIN()} style={styles.login} />
        <Font type='Title' style={{ color: NEUTRAL.MAIN }}>
          DALRYEO
        </Font>
      </View>
      <Pressable
        style={styles.buttonContainer}
        onPress={handleLogin}
        disabled={isLogging}
      >
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  loginContainer: {
    alignItems: 'center',
  },
  login: {
    width: 230,
    height: 180,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 80,
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
