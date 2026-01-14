import AntDesign from '@expo/vector-icons/AntDesign';
import { Pressable, StyleSheet, View } from 'react-native';

import { NEUTRAL } from '../../constants/Colors';
import { useAppFonts } from '../../hooks/useAppFonts';
import { useAppleLogin } from '../../hooks/useAppleLogin';
import { Font } from '../Font';

function Login() {
  const [fontsLoaded] = useAppFonts();
  const { login } = useAppleLogin();

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Pressable style={styles.buttonContainer} onPress={login}>
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
