import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
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

const BORDER_RADIUS = RANKING_LAYOUT.MY_RECORD.BORDER_RADIUS;
const BORDER_WIDTH = 1;

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
    <View style={styles.shadowWrapper}>
      <LinearGradient
        colors={[
          'rgba(118,118,118,1)',
          'rgba(91,91,91,1)',
          'rgba(91,91,91,0.15)',
          'rgba(91,91,91,0.30)',
          'rgba(118,118,118,1)',
        ]}
        locations={[0, 0.12, 0.39, 0.71, 1.0]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientBorder}
      >
        <View style={styles.container}>
          <Font type='SubButton' style={styles.title}>
            내 기록
          </Font>

          <View style={styles.divider}>{gradientSegments}</View>

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
      </LinearGradient>
    </View>
  );
}

const { MY_RECORD } = RANKING_LAYOUT;

const styles = StyleSheet.create({
  shadowWrapper: {
    marginTop: MY_RECORD.MARGIN_TOP,
    marginHorizontal: MY_RECORD.MARGIN_HORIZONTAL,
    borderRadius: BORDER_RADIUS,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  gradientBorder: {
    borderRadius: BORDER_RADIUS,
    padding: BORDER_WIDTH,
    overflow: 'hidden',
  },
  container: {
    borderRadius: BORDER_RADIUS - BORDER_WIDTH,
    padding: MY_RECORD.PADDING,
    backgroundColor: NEUTRAL.BLACK,
    alignItems: 'center',
  },
  title: {
    color: NEUTRAL.GRAY_500,
  },
  divider: {
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
