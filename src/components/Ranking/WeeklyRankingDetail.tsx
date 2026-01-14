import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { RANKING_LAYOUT } from '../../constants/RankingLayout';
import { getMockRankingData } from '../../data/mockRankingData';
import { RankingType } from '../../types/ranking.types';
import { getRankingConfig } from '../../utils/rankingUtils';
import { Font } from '../Font';
import { PodiumRanking } from './PodiumRanking';
import { RankingList } from './RankingList';

export function WeeklyRankingDetail() {
  const params = useLocalSearchParams();
  const type = params.type as RankingType;

  console.log('📍 Received type:', type);

  if (!type || (type !== 'tier' && type !== 'distance')) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size='large' color={NEUTRAL.MAIN} />
        </View>
      </View>
    );
  }

  const data = getMockRankingData(type);
  const config = getRankingConfig(type);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons
            name='chevron-back'
            size={DETAIL.BACK_ICON.SIZE}
            color={NEUTRAL.GRAY_200}
          />
        </TouchableOpacity>

        <Font type='Head5' style={styles.title}>
          {config.title}
        </Font>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <PodiumRanking rankings={data.rankings} type={type} />
        <RankingList
          type={type}
          myRecord={data.myRecord}
          rankings={data.rankingList}
        />
      </ScrollView>
    </View>
  );
}

const { DETAIL } = RANKING_LAYOUT;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.GRAY_900,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: DETAIL.HEADER.PADDING_TOP,
    paddingBottom: DETAIL.HEADER.PADDING_BOTTOM,
    paddingHorizontal: DETAIL.HEADER.PADDING_HORIZONTAL,
    backgroundColor: NEUTRAL.BLACK,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: DETAIL.BACK_ICON.LEFT,
    top: DETAIL.BACK_ICON.TOP,
    padding: 8,
  },
  title: {
    color: NEUTRAL.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
