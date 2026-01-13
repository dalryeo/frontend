import { StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { RANKING_LAYOUT } from '../../constants/RankingLayout';
import {
  RankingListItem as RankingListItemType,
  RankingType,
} from '../../types/ranking.types';
import { formatNickname } from '../../utils/formatNickname';
import { Font } from '../Font';

interface RankingListItemProps {
  type: RankingType;
  item: RankingListItemType;
}

export function RankingListItem({ type, item }: RankingListItemProps) {
  const renderRecord = () => {
    if (type === 'tier') {
      return (
        <>
          <Font type='Body1' style={styles.primaryText}>
            {item.time}
          </Font>
          <Font type='Body4' style={styles.secondaryText}>
            {item.distance}
          </Font>
        </>
      );
    }

    return (
      <>
        <Font type='Body1' style={styles.primaryText}>
          {item.distance}
        </Font>
        <Font type='Body4' style={styles.secondaryText}>
          {item.time}
        </Font>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.rankWrapper}>
          <Font type='Body2' style={styles.rankText}>
            {item.rank}
          </Font>
        </View>

        <View style={styles.profileWrapper}>
          <View style={styles.profileImg} />
          <Font type='Body2' style={styles.foxEmoji}>
            🦊
          </Font>
        </View>

        <View style={styles.nicknameWrapper}>
          <Font type='Body4' style={styles.nickname}>
            {formatNickname(item.nickname, 8)}
          </Font>
        </View>

        <View style={styles.recordWrapper}>
          <View style={styles.recordText}>{renderRecord()}</View>
        </View>
      </View>
    </View>
  );
}

const { LIST, LIST_ITEM } = RANKING_LAYOUT;

const styles = StyleSheet.create({
  container: {
    marginTop: LIST.ITEM_MARGIN_TOP,
    marginHorizontal: LIST.ITEM_MARGIN_HORIZONTAL,
    borderRadius: LIST.ITEM_BORDER_RADIUS,
    paddingVertical: LIST.ITEM_PADDING_VERTICAL,
    paddingHorizontal: LIST.ITEM_PADDING_HORIZONTAL,
    backgroundColor: NEUTRAL.BLACK,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: LIST_ITEM.MIN_HEIGHT,
    marginRight: LIST_ITEM.RANK_MARGIN_RIGHT,
  },
  rankText: {
    color: NEUTRAL.DARKGREEN,
  },
  profileWrapper: {
    position: 'relative',
  },
  profileImg: {
    width: LIST_ITEM.PROFILE.SIZE,
    height: LIST_ITEM.PROFILE.SIZE,
    borderRadius: LIST_ITEM.PROFILE.BORDER_RADIUS,
    borderWidth: LIST_ITEM.PROFILE.BORDER_WIDTH,
    borderColor: NEUTRAL.GRAY_600,
    backgroundColor: NEUTRAL.GRAY_800,
  },
  foxEmoji: {
    position: 'absolute',
    bottom: LIST_ITEM.PROFILE.EMOJI_BOTTOM,
    right: LIST_ITEM.PROFILE.EMOJI_RIGHT,
    fontSize: LIST_ITEM.PROFILE.EMOJI_SIZE,
    paddingHorizontal: 1,
    paddingVertical: 1,
  },
  nicknameWrapper: {
    marginLeft: LIST_ITEM.NICKNAME_MARGIN_LEFT,
    flex: 1,
    justifyContent: 'center',
    minHeight: LIST_ITEM.MIN_HEIGHT,
  },
  nickname: {
    color: NEUTRAL.GRAY_300,
    textAlign: 'left',
    lineHeight: LIST_ITEM.NICKNAME_LINE_HEIGHT,
  },
  recordWrapper: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  recordText: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  primaryText: {
    color: NEUTRAL.MAIN,
  },
  secondaryText: {
    color: NEUTRAL.GRAY_600,
  },
});
