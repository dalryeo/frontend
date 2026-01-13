import { ScrollView, StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { LAYOUT } from '../../constants/Layout';
import { getMockRankingData } from '../../data/mockRankingData'; // 🆕
import { useAppFonts } from '../../hooks/useAppFonts';
import { EmptyRanking } from './EmptyRanking';
import { RankingHeader } from './RankingHeader';
import { WeeklyRanking } from './WeeklyRanking';

export function Ranking() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) return null;

  const hasRankingData = true;

  const tierData = getMockRankingData('tier').rankings;
  const distanceData = getMockRankingData('distance').rankings;

  return (
    <View style={styles.container}>
      <RankingHeader showAccountIcon={hasRankingData} />

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
});
