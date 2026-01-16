import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';
import { NEUTRAL } from '../../constants/Colors';
import { useAppFonts } from '../../hooks/useAppFonts';

function Analysis() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.Icon}>
        <Image
          source={require('../../../assets/images/Main/accountIcon.png')}
          style={styles.accountIcon}
        />

        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <Image
            source={require('../../../assets/images/Ranking/home.png')}
            style={styles.accountIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  Icon: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 70,
    marginRight: 20,
  },
  recordIcon: {
    width: 32,
    height: 32,
  },
  accountIcon: {
    width: 32,
    height: 32,
    marginLeft: 20,
  },
});

export { Analysis };
