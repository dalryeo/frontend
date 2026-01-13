import { Image, StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { RANKING_LAYOUT } from '../../constants/RankingLayout';
import { formatNickname } from '../../utils/formatNickname';
import { Font } from '../Font';
import { RankingInfoBanner } from './RankingInfoBanner';

interface RankingItem {
  rank: number;
  isFirst: boolean;
  nickname: string;
  time: string;
  distance: string;
}

interface PodiumRankingProps {
  rankings: RankingItem[];
  type: 'tier' | 'distance';
}

export function PodiumRanking({ rankings, type }: PodiumRankingProps) {
  const getProfileImgStyle = (isFirst: boolean) => {
    return isFirst ? styles.profileImg : styles.profileImgSecondThird;
  };

  const getFoxEmojiStyle = (isFirst: boolean) => {
    return isFirst ? styles.foxEmojiFirst : styles.foxEmojiSecondThird;
  };

  const getStageImage = (rank: number) => {
    switch (rank) {
      case 1:
        return require('../../../assets/images/Ranking/firststage.png');
      case 2:
        return require('../../../assets/images/Ranking/secondstage.png');
      case 3:
        return require('../../../assets/images/Ranking/thirdstage.png');
      default:
        return require('../../../assets/images/Ranking/thirdstage.png');
    }
  };

  const getRankImage = (rank: number) => {
    switch (rank) {
      case 1:
        return require('../../../assets/images/Ranking/first.png');
      case 2:
        return require('../../../assets/images/Ranking/second.png');
      case 3:
        return require('../../../assets/images/Ranking/third.png');
      default:
        return require('../../../assets/images/Ranking/third.png');
    }
  };

  const getRankImageStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return styles.rankImageFirst;
      case 2:
        return styles.rankImageSecond;
      case 3:
        return styles.rankImageThird;
      default:
        return styles.rankImageThird;
    }
  };

  const getStageStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return styles.stageFirst;
      case 2:
        return styles.stageSecond;
      case 3:
        return styles.stageThird;
      default:
        return styles.stageThird;
    }
  };

  const renderStageText = (item: RankingItem) => {
    if (type === 'tier') {
      return (
        <>
          <Font type='Body7' style={styles.secondaryText}>
            {item.distance}
          </Font>
          <Font type='Head4' style={styles.primaryText}>
            {item.time}
          </Font>
        </>
      );
    }

    return (
      <>
        <Font type='Body7' style={styles.secondaryText}>
          {item.time}
        </Font>
        <Font type='Head4' style={styles.primaryText}>
          {item.distance}
        </Font>
      </>
    );
  };

  return (
    <View style={styles.podiumContainer}>
      <View style={styles.rankingRow}>
        {rankings.map((item, index) => (
          <View key={index} style={styles.rankingContainer}>
            <View style={styles.profileWrapper}>
              <View style={getProfileImgStyle(item.isFirst)} />
              <Font type='Body2' style={getFoxEmojiStyle(item.isFirst)}>
                🦊
              </Font>
            </View>

            <View style={styles.nicknameContainer}>
              <Font type='Body5' style={styles.nickname}>
                {formatNickname(item.nickname, 6)}
              </Font>
            </View>

            <View style={styles.stageWrapper}>
              <Image
                source={getStageImage(item.rank)}
                style={[styles.stageImage, getStageStyle(item.rank)]}
                resizeMode='stretch'
              />

              <Image
                source={getRankImage(item.rank)}
                style={getRankImageStyle(item.rank)}
                resizeMode='contain'
              />

              <View style={styles.stageTextContainer}>
                {renderStageText(item)}
              </View>
            </View>
          </View>
        ))}
      </View>

      <RankingInfoBanner />
    </View>
  );
}

const { PODIUM, PROFILE, STAGE } = RANKING_LAYOUT;

const styles = StyleSheet.create({
  podiumContainer: {
    paddingTop: PODIUM.PADDING_TOP,
    paddingBottom: PODIUM.PADDING_BOTTOM,
    paddingHorizontal: PODIUM.PADDING_HORIZONTAL,
    borderBottomLeftRadius: PODIUM.BORDER_RADIUS,
    borderBottomRightRadius: PODIUM.BORDER_RADIUS,
    backgroundColor: NEUTRAL.BACKGROUND,
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
  profileWrapper: {
    position: 'relative',
    marginBottom: 10,
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
    shadowColor: NEUTRAL.GRAY_600,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 9,
    elevation: 0,
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
  nicknameContainer: {
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 16,
  },
  nickname: {
    color: NEUTRAL.WHITE,
    textAlign: 'center',
    lineHeight: 16,
  },
  stageWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  stageImage: {
    width: '100%',
  },
  stageFirst: {
    height: STAGE.HEIGHT.FIRST,
  },
  stageSecond: {
    height: STAGE.HEIGHT.SECOND,
  },
  stageThird: {
    height: STAGE.HEIGHT.THIRD,
  },
  rankImageFirst: {
    position: 'absolute',
    top: STAGE.RANK_IMAGE.TOP_PERCENT.FIRST,
    width: STAGE.RANK_IMAGE.SIZE,
    height: STAGE.RANK_IMAGE.SIZE,
  },
  rankImageSecond: {
    position: 'absolute',
    top: STAGE.RANK_IMAGE.TOP_PERCENT.SECOND,
    width: STAGE.RANK_IMAGE.SIZE,
    height: STAGE.RANK_IMAGE.SIZE,
  },
  rankImageThird: {
    position: 'absolute',
    top: STAGE.RANK_IMAGE.TOP_PERCENT.THIRD,
    width: STAGE.RANK_IMAGE.SIZE,
    height: STAGE.RANK_IMAGE.SIZE,
  },
  stageTextContainer: {
    position: 'absolute',
    top: STAGE.TEXT_TOP_PERCENT,
    alignItems: 'center',
  },
  primaryText: {
    color: NEUTRAL.BLACK,
    marginBottom: 2,
  },
  secondaryText: {
    color: NEUTRAL.GRAY_700,
  },
});
