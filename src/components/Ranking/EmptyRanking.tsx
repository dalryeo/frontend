import { IMAGES } from '@/src/constants/Images';
import { LAYOUT } from '@/src/constants/Layout';
import { Image, StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { Font } from '../Font';

export function EmptyRanking() {
  return (
    <View style={styles.container}>
      <Image source={IMAGES.EMPTY.TURTLE_EMPTY()} style={styles.imageBox} />

      <Font type='Head3' style={styles.title}>
        이번 주의 기록이{'\n'}쌓이는 중이에요
      </Font>

      <Font type='Body4' style={styles.description}>
        월요일에 첫 랭킹이 정산돼요{'\n'}
        지금 달리면 상위권의 주인공이 될 수 있어요
      </Font>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: LAYOUT.EMPTY.PADDING_TOP,
  },
  imageBox: {
    height: 180,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    color: NEUTRAL.WHITE,
    textAlign: 'center',
    marginBottom: LAYOUT.EMPTY.MARGIN_BOTTOM_TITLE,
  },
  description: {
    color: NEUTRAL.GRAY_500,
    textAlign: 'center',
    lineHeight: 24,
  },
});
