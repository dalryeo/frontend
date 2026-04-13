import { Image, StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../constants/Colors';
import { IMAGES } from '../constants/Images';
import { Font } from './Font';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={IMAGES.APP.SPLASH()} style={styles.logo} />
      <Font type='Title' style={{ color: NEUTRAL.MAIN }}>
        DALRYEO
      </Font>
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
  logo: {
    width: 200,
    height: 200,
  },
});
