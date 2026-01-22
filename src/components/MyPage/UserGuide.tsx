import { StyleSheet, View } from 'react-native';

import { NEUTRAL } from '../../constants/Colors';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

function UserGuide() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Ionicons
          name='chevron-back'
          size={24}
          style={[styles.back, { color: NEUTRAL.WHITE }]}
          onPress={() => router.back()}
        />
        <Font type='Head5' style={styles.title}>
          달려 이용 가이드
        </Font>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.GRAY_900,
  },
  titleContainer: {
    alignContent: 'center',
    paddingTop: 75,
    paddingBottom: 20,
    backgroundColor: NEUTRAL.BLACK,
  },
  back: {
    position: 'absolute',
    top: 75,
    left: 10,
  },
  title: {
    color: NEUTRAL.WHITE,
    alignSelf: 'center',
  },
});

export { UserGuide };
