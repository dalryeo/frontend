import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { RANKING_LAYOUT } from '../../constants/RankingLayout';
import { RankingItem, RankingType } from '../../types/ranking.types';
import { formatNickname, isMultiLineNickname } from '../../utils/formatUtils';
import { getRankingConfig } from '../../utils/rankingUtils';
import { Font } from '../Font';

interface WeeklyRankingProps {
  type: RankingType;
  rankings: RankingItem[];
}

export function WeeklyRanking({ type, rankings }: WeeklyRankingProps) {
  const config = getRankingConfig(type);

  const handlePress = () => {
    router.push({
      pathname: '/weeklyRankingDetail',
      params: { type: type },
    });
  };

  const renderRankIcon = (rank: number, isFirst: boolean) => {
    if (isFirst) {
      return (
        <Image
          source={require('../../../assets/images/Ranking/crown.png')}
          style={styles.rankIcon}
        />
      );
    }
    return (
      <Font type='Body2' style={styles.rankNumber}>
        {rank}
      </Font>
    );
  };

  const getProfileImgStyle = (isFirst: boolean) => {
    return isFirst ? styles.profileImg : styles.profileImgSecondThird;
  };

  const getFoxEmojiStyle = (isFirst: boolean) => {
    return isFirst ? styles.foxEmojiFirst : styles.foxEmojiSecondThird;
  };

  const renderInfoText = (item: RankingItem) => {
    if (type === 'tier') {
      return (
        <>
          <Font type='Head4' style={styles.primaryText}>
            {item.time}
          </Font>
          <Font type='Body7' style={styles.secondaryText}>
            {item.distance}
          </Font>
        </>
      );
    }

    return (
      <>
        <Font type='Head4' style={styles.primaryText}>
          {item.distance}
        </Font>
        <Font type='Body7' style={styles.secondaryText}>
          {item.time}
        </Font>
      </>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Font type='Head5'>{config.title}</Font>
        <MaterialIcons
          name='navigate-next'
          size={24}
          color={NEUTRAL.GRAY_600}
        />
      </View>

      <View style={styles.rankingRow}>
        {rankings.map((item, index) => (
          <View key={index} style={styles.rankingContainer}>
            {renderRankIcon(item.rank, item.isFirst)}

            <View style={styles.profileWrapper}>
              <View style={getProfileImgStyle(item.isFirst)} />
              <Font type='Body2' style={getFoxEmojiStyle(item.isFirst)}>
                🦊
              </Font>
            </View>

            <View style={styles.infoContainer}>
              <View
                style={[
                  styles.nicknameContainer,
                  isMultiLineNickname(item.nickname) &&
                    styles.nicknameContainerMultiLine,
                ]}
              >
                <Font type='Body5' style={styles.nickname}>
                  {formatNickname(item.nickname)}
                </Font>
              </View>
              {renderInfoText(item)}
            </View>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const { WEEKLY, PROFILE, RANK_ICON, INFO } = RANKING_LAYOUT;

const styles = StyleSheet.create({
  container: {
    borderRadius: WEEKLY.BORDER_RADIUS,
    padding: WEEKLY.PADDING,
    backgroundColor: NEUTRAL.BLACK,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: RANKING_LAYOUT.WEEKLY.HEADER_MARGIN_BOTTOM,
  },
  rankingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  rankingContainer: {
    alignItems: 'center',
    width: '30%',
  },
  rankIcon: {
    width: RANK_ICON.SIZE,
    height: RANK_ICON.SIZE,
    marginBottom: RANK_ICON.MARGIN_BOTTOM,
  },
  rankNumber: {
    marginBottom: RANK_ICON.MARGIN_BOTTOM,
    color: NEUTRAL.MAIN,
  },
  profileWrapper: {
    position: 'relative',
  },
  profileImg: {
    width: PROFILE.FIRST.SIZE,
    height: PROFILE.FIRST.SIZE,
    borderRadius: PROFILE.FIRST.BORDER_RADIUS,
    borderWidth: PROFILE.BORDER_WIDTH,
    borderColor: NEUTRAL.MAIN,
    backgroundColor: NEUTRAL.GRAY_800,
    shadowColor: NEUTRAL.MAIN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 9,
    elevation: 0,
  },
  profileImgSecondThird: {
    width: PROFILE.OTHER.SIZE,
    height: PROFILE.OTHER.SIZE,
    borderRadius: PROFILE.OTHER.BORDER_RADIUS,
    borderWidth: PROFILE.BORDER_WIDTH,
    borderColor: NEUTRAL.GRAY_600,
    backgroundColor: NEUTRAL.GRAY_800,
  },
  foxEmojiFirst: {
    position: 'absolute',
    bottom: PROFILE.FIRST.EMOJI_BOTTOM,
    right: PROFILE.FIRST.EMOJI_RIGHT,
    fontSize: PROFILE.FIRST.EMOJI_SIZE,
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  foxEmojiSecondThird: {
    position: 'absolute',
    bottom: PROFILE.OTHER.EMOJI_BOTTOM,
    right: PROFILE.OTHER.EMOJI_RIGHT,
    fontSize: PROFILE.OTHER.EMOJI_SIZE,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: INFO.MARGIN_TOP,
    width: '100%',
  },
  nicknameContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: INFO.NICKNAME.MARGIN_BOTTOM,
    marginTop: INFO.NICKNAME.MARGIN_TOP,
    minHeight: INFO.NICKNAME.MIN_HEIGHT,
  },
  nicknameContainerMultiLine: {
    marginBottom: INFO.NICKNAME.MARGIN_BOTTOM_MULTILINE,
  },
  nickname: {
    color: NEUTRAL.WHITE,
    textAlign: 'center',
    lineHeight: INFO.NICKNAME.LINE_HEIGHT,
  },
  primaryText: {
    color: NEUTRAL.MAIN,
    marginBottom: INFO.PRIMARY_MARGIN_BOTTOM,
  },
  secondaryText: {
    color: NEUTRAL.GRAY_500,
  },
});
