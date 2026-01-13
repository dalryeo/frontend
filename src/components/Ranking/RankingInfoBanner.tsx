import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { RANKING_LAYOUT } from '../../constants/RankingLayout';
import { Font } from '../Font';

export function RankingInfoBanner() {
  return (
    <View style={styles.container}>
      <MaterialIcons
        name='error-outline'
        size={RANKING_LAYOUT.INFO_BANNER.ICON_SIZE}
        color={NEUTRAL.GRAY_600}
      />
      <Font type='Error' style={styles.text}>
        랭킹은 매주 월요일마다 초기화돼요
      </Font>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: RANKING_LAYOUT.INFO_BANNER.MARGIN_TOP,
  },
  text: {
    marginLeft: RANKING_LAYOUT.INFO_BANNER.TEXT_MARGIN_LEFT,
    color: NEUTRAL.GRAY_600,
  },
});
