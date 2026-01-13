import { StyleSheet, View } from 'react-native';
import { RANKING_LAYOUT } from '../../constants/RankingLayout';
import {
  MyRecord,
  RankingListItem as RankingListItemType,
  RankingType,
} from '../../types/ranking.types';
import { MyRankingRecord } from './MyRankingRecord';
import { RankingListItem } from './RankingListItem';

interface RankingListProps {
  type: RankingType;
  myRecord: MyRecord;
  rankings: RankingListItemType[];
}

export function RankingList({ type, myRecord, rankings }: RankingListProps) {
  return (
    <View style={styles.container}>
      <MyRankingRecord type={type} myRecord={myRecord} />

      {rankings.map((item, index) => (
        <RankingListItem key={index} type={type} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingBottom: RANKING_LAYOUT.LIST.PADDING_BOTTOM,
  },
});
