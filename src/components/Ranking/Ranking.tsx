import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { LAYOUT } from '../../constants/Layout';
import { useAppFonts } from '../../hooks/useAppFonts';
import {
  fetchDistanceRanking,
  fetchScoreRanking,
} from '../../services/rankingService';
import { RankingItem } from '../../types/ranking.types';
import {
  transformDistanceRankingToItems,
  transformScoreRankingToItems,
} from '../../utils/rankingUtils';
import { EmptyRanking } from './EmptyRanking';
import { RankingHeader } from './RankingHeader';
import { WeeklyRanking } from './WeeklyRanking';

export function Ranking() {
  const [fontsLoaded] = useAppFonts();
  const [tierData, setTierData] = useState<RankingItem[]>([]);
  const [distanceData, setDistanceData] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRankingData() {
      try {
        const [scoreResponse, distanceResponse] = await Promise.all([
          fetchScoreRanking(),
          fetchDistanceRanking(),
        ]);

        if (scoreResponse.success) {
          setTierData(transformScoreRankingToItems(scoreResponse.data));
        }

        if (distanceResponse.success) {
          setDistanceData(
            transformDistanceRankingToItems(distanceResponse.data),
          );
        }
      } catch (error) {
        console.error('랭킹 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRankingData();
  }, []);

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.container}>
        <RankingHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='small' color={NEUTRAL.MAIN} />
        </View>
      </View>
    );
  }

  const hasRankingData = tierData.length > 0 || distanceData.length > 0;

  return (
    <View style={styles.container}>
      <RankingHeader />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {hasRankingData ? (
            <>
              <WeeklyRanking type='tier' rankings={tierData} />
              <View style={styles.spacer} />
              <WeeklyRanking type='distance' rankings={distanceData} />
            </>
          ) : (
            <EmptyRanking />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    marginTop: LAYOUT.CONTENT.MARGIN_TOP,
    marginHorizontal: LAYOUT.CONTENT.MARGIN_HORIZONTAL,
    paddingBottom: LAYOUT.CONTENT.PADDING_BOTTOM,
  },
  spacer: {
    height: LAYOUT.SPACER.MEDIUM,
  },
  loadingContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
