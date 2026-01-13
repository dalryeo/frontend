import { useMemo } from 'react'; // 🆕 추가
import { StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { RANKING_LAYOUT } from '../../constants/RankingLayout';
import { MyRecord, RankingType } from '../../types/ranking.types';
import { getMyRecordValue, getRankingConfig } from '../../utils/rankingUtils';
import { Font } from '../Font';

interface MyRankingRecordProps {
  type: RankingType;
  myRecord: MyRecord;
}

export function MyRankingRecord({ type, myRecord }: MyRankingRecordProps) {
  const config = getRankingConfig(type);
  const primaryValue = getMyRecordValue(type, myRecord);

  const gradientSegments = useMemo(() => {
    const segments = [];
    const totalSegments = 50;

    for (let i = 0; i < totalSegments; i++) {
      const position = i / (totalSegments - 1);
      const intensity = Math.sin(position * Math.PI);
      const opacity = 0.05 + intensity * 0.55;

      segments.push(
        <View
          key={i}
          style={{
            flex: 1,
            height: 1,
            backgroundColor: `rgba(183, 183, 183, ${opacity})`,
          }}
        />,
      );
    }

    return segments;
  }, []);

  return (
    <View style={styles.container}>
      <Font type='SubButton' style={styles.title}>
        내 기록
      </Font>

      <View style={styles.gradientBorder}>{gradientSegments}</View>

      <View style={styles.content}>
        <View style={styles.profileWrapper}>
          <View style={styles.profileImg} />
          <Font type='Body2' style={styles.foxEmoji}>
            🦊
          </Font>
        </View>

        <View style={styles.stat}>
          <Font type='Body7' style={styles.statTitle}>
            {config.myRecordLabel}
          </Font>
          <Font
            type='Head4'
            style={[styles.statValue, !myRecord && styles.statValueEmpty]}
          >
            {primaryValue}
          </Font>
        </View>

        <View style={styles.stat}>
          <Font type='Body7' style={styles.statTitle}>
            내 순위
          </Font>
          <Font
            type='Head4'
            style={[styles.statValue, !myRecord && styles.statValueEmpty]}
          >
            {myRecord?.rank || '-'}
          </Font>
        </View>

        <View style={styles.stat}>
          <Font type='Body7' style={styles.statTitle}>
            상위
          </Font>
          <Font
            type='Head4'
            style={[styles.statValue, !myRecord && styles.statValueEmpty]}
          >
            {myRecord?.percentage || '-'}
          </Font>
        </View>
      </View>
    </View>
  );
}

const { MY_RECORD } = RANKING_LAYOUT;

const styles = StyleSheet.create({
  container: {
    marginTop: MY_RECORD.MARGIN_TOP,
    marginHorizontal: MY_RECORD.MARGIN_HORIZONTAL,
    borderRadius: MY_RECORD.BORDER_RADIUS,
    padding: MY_RECORD.PADDING,
    backgroundColor: NEUTRAL.BLACK,
    alignItems: 'center',
  },
  title: {
    color: NEUTRAL.GRAY_500,
  },
  gradientBorder: {
    flexDirection: 'row',
    marginTop: MY_RECORD.GRADIENT_MARGIN_TOP,
    width: '100%',
    height: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: MY_RECORD.CONTENT_WIDTH_PERCENT,
    marginTop: MY_RECORD.CONTENT_MARGIN_TOP,
  },
  profileWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  profileImg: {
    width: MY_RECORD.PROFILE.SIZE,
    height: MY_RECORD.PROFILE.SIZE,
    borderRadius: MY_RECORD.PROFILE.BORDER_RADIUS,
    borderWidth: MY_RECORD.PROFILE.BORDER_WIDTH,
    borderColor: NEUTRAL.GRAY_600,
    backgroundColor: NEUTRAL.GRAY_800,
  },
  foxEmoji: {
    position: 'absolute',
    bottom: MY_RECORD.PROFILE.EMOJI_BOTTOM,
    right: MY_RECORD.PROFILE.EMOJI_RIGHT,
    fontSize: MY_RECORD.PROFILE.EMOJI_SIZE,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  stat: {
    alignItems: 'center',
  },
  statTitle: {
    color: NEUTRAL.GRAY_300,
  },
  statValue: {
    color: NEUTRAL.MAIN,
  },
  statValueEmpty: {
    color: NEUTRAL.GRAY_100,
  },
});
