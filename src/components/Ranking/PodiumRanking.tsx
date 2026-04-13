import { Image, StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { IMAGES, getRankingTierImage } from '../../constants/Images';
import { RANKING_LAYOUT } from '../../constants/RankingLayout';
import { formatNickname } from '../../utils/formatUtils';
import { Font } from '../Font';
import { RankingInfoBanner } from './RankingInfoBanner';

interface RankingItem {
  rank: number;
  isFirst: boolean;
  nickname: string;
  tierCode: string;
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

  const getStageImage = (rank: number) => {
    switch (rank) {
      case 1:
        return IMAGES.RANKING.STAGE.FIRST();
      case 2:
        return IMAGES.RANKING.STAGE.SECOND();
      case 3:
        return IMAGES.RANKING.STAGE.THIRD();
      default:
        return IMAGES.RANKING.STAGE.THIRD();
    }
  };

  const getRankImage = (rank: number) => {
    switch (rank) {
      case 1:
        return IMAGES.RANKING.MEDAL.FIRST();
      case 2:
        return IMAGES.RANKING.MEDAL.SECOND();
      case 3:
        return IMAGES.RANKING.MEDAL.THIRD();
      default:
        return IMAGES.RANKING.MEDAL.THIRD();
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

  const getStageTextTop = (rank: number) => {
    switch (rank) {
      case 1:
        return STAGE.TEXT_TOP_PERCENT.FIRST;
      case 2:
        return STAGE.TEXT_TOP_PERCENT.SECOND;
      case 3:
        return STAGE.TEXT_TOP_PERCENT.THIRD;
      default:
        return STAGE.TEXT_TOP_PERCENT.THIRD;
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

  const top3 = rankings.slice(0, 3).sort((a, b) => a.rank - b.rank);
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <View style={styles.podiumContainer}>
      <View style={styles.rankingRow}>
        {podiumOrder.map((item, index) => (
          <View key={index} style={styles.rankingContainer}>
            <View style={styles.profileWrapper}>
              <Image
                source={
                  getRankingTierImage(item.rank, item.tierCode) ?? undefined
                }
                style={getProfileImgStyle(item.isFirst)}
                resizeMode='contain'
              />
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

              <View
                style={[
                  styles.stageTextContainer,
                  { top: getStageTextTop(item.rank) },
                ]}
              >
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

const { PODIUM, STAGE } = RANKING_LAYOUT;

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
    width: 110,
    height: 110,
    shadowColor: NEUTRAL.MAIN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 9,
    elevation: 0,
  },
  profileImgSecondThird: {
    width: 110,
    height: 110,
    shadowColor: NEUTRAL.GRAY_600,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 9,
    elevation: 0,
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
