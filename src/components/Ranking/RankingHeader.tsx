import { router } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { LAYOUT } from '../../constants/Layout';

export function RankingHeader() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/myPage')}>
        <Image
          source={require('../../../assets/images/Main/accountIcon.png')}
          style={styles.icon}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(tabs)')}>
        <Image
          source={require('../../../assets/images/Ranking/home.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: LAYOUT.HEADER.MARGIN_TOP,
    marginRight: LAYOUT.HEADER.MARGIN_RIGHT,
  },
  icon: {
    width: LAYOUT.ICON.SIZE,
    height: LAYOUT.ICON.SIZE,
    marginLeft: LAYOUT.ICON.SPACING,
  },
});
