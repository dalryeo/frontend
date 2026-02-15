import { useAuth } from '@/src/contexts/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { RANKING_LAYOUT } from '../../constants/RankingLayout';
import {
  fetchDistanceRankingDetail,
  fetchMyRanking,
  fetchScoreRankingDetail,
} from '../../services/rankingService';
import {
  MyRecord,
  RankingItem,
  RankingListItem,
  RankingType,
} from '../../types/ranking.types';
import {
  getRankingConfig,
  transformDistanceRankingToItems,
  transformMyRankingToRecord,
  transformScoreRankingToItems,
  transformToRankingListItems,
} from '../../utils/rankingUtils';
import { Font } from '../Font';
import { PodiumRanking } from './PodiumRanking';
import { RankingList } from './RankingList';

export function WeeklyRankingDetail() {
  const params = useLocalSearchParams();
  const type = params.type as RankingType;
  const isValidType = type === 'tier' || type === 'distance';
  const { getAccessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [myRecord, setMyRecord] = useState<MyRecord | null>(null);
  const [podiumRankings, setPodiumRankings] = useState<RankingItem[]>([]);
  const [allRankings, setAllRankings] = useState<RankingListItem[]>([]);

  useEffect(() => {
    if (!isValidType) {
      setLoading(false);
      return;
    }

    async function loadDetailData() {
      try {
        const accessToken = await getAccessToken();

        if (!accessToken) {
          console.log('액세스 토큰이 없습니다');
          return;
        }

        const [myRankingResponse, rankingResponse] = await Promise.all([
          fetchMyRanking(accessToken),
          type === 'tier'
            ? fetchScoreRankingDetail()
            : fetchDistanceRankingDetail(),
        ]);

        if (
          myRankingResponse.success &&
          myRankingResponse.data &&
          !('code' in myRankingResponse.data)
        ) {
          setMyRecord(transformMyRankingToRecord(myRankingResponse.data, type));
        } else {
          setMyRecord(null);
        }

        if (rankingResponse.success && rankingResponse.data) {
          const transformedItems =
            type === 'tier'
              ? transformScoreRankingToItems(rankingResponse.data)
              : transformDistanceRankingToItems(rankingResponse.data);

          setPodiumRankings(transformedItems.slice(0, 3));
          setAllRankings(transformToRankingListItems(rankingResponse.data));
        }
      } catch (error) {
        console.error('상세 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDetailData();
  }, [type, isValidType, getAccessToken]);

  if (!isValidType) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size='small' color={NEUTRAL.MAIN} />
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <ActivityIndicator size='small' color={NEUTRAL.MAIN} />
        </View>
      </View>
    );
  }

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
        <PodiumRanking rankings={podiumRankings} type={type} />
        <RankingList type={type} myRecord={myRecord} rankings={allRankings} />
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
