import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { NEUTRAL } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAppFonts } from '../../hooks/useAppFonts';
import { useWeeklyRecord } from '../../hooks/useWeeklyRecord';
import { Font } from '../Font';
import { TierInfoCard } from './TierInfoCard';

import { useRandomMessage } from '../../hooks/useRandomMessage';
import {
  generateGradientSegments,
  getDisplayName,
  getTierEmoji,
} from '../../utils/commonUtils';
import { formatPace } from '../../utils/formatUtils';

const BORDER_RADIUS = 30;
const BORDER_WIDTH = 1;

function GradientBorderCard({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
}) {
  return (
    <View style={[styles.shadowWrapper, style]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.gradientWrapper}
      >
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
          <View style={styles.gradientInner}>{children}</View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function MainScreen() {
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();
  const { user } = useAuth();
  const { weeklyRecord, loading, error, refetch } = useWeeklyRecord();

  const commentMessage = useRandomMessage();

  useFocusEffect(
    useCallback(() => {
      if (refetch) {
        refetch();
      } else {
        console.error('refetch 함수가 undefined입니다!');
      }
    }, [refetch]),
  );

  const getCurrentTierDisplay = () => {
    if (!hasRecord || !weeklyRecord?.currentTier) {
      return '-';
    }
    return `${getTierEmoji(weeklyRecord.currentTier)}`;
  };

  if (!fontsLoaded) return null;

  const displayName = getDisplayName(user);
  const gradientSegments = generateGradientSegments();
  const hasRecord = weeklyRecord && weeklyRecord.weeklyCount > 0;

  return (
    <View style={styles.container}>
      <View style={styles.Icon}>
        <TouchableOpacity onPress={() => router.push('/myPage')}>
          <Image
            source={require('../../../assets/images/Main/accountIcon.png')}
            style={styles.accountIcon}
          />
        </TouchableOpacity>
      </View>

      <Font type='Head2' style={styles.title}>
        {displayName}님,{'\n'}이번 주도 달려볼까요?
      </Font>

      <GradientBorderCard
        onPress={() => router.push('/weeklyRecord')}
        style={styles.weeklyRecordWrapper}
      >
        <View style={styles.weeklyRecordTitle}>
          <Font type='SubButton' style={styles.weeklyRecordTitleText}>
            주간 기록
          </Font>
        </View>

        <View style={styles.dividerContainer}>
          {gradientSegments.map((segment) => (
            <View
              key={segment.id}
              style={{
                flex: 1,
                height: 1,
                backgroundColor: `rgba(183, 183, 183, ${segment.opacity})`,
              }}
            />
          ))}
        </View>

        <View style={styles.recordList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size='small' color={NEUTRAL.MAIN} />
              <Font type='Body4' style={styles.loadingText}>
                데이터를 불러오는 중...
              </Font>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Font type='Body4' style={styles.errorText}>
                데이터를 불러올 수 없습니다
              </Font>
            </View>
          ) : (
            <>
              <View style={styles.recordItem}>
                <Font
                  type='Head2'
                  style={[
                    styles.recordItemTop,
                    hasRecord ? {} : { color: NEUTRAL.GRAY_100 },
                  ]}
                >
                  {getCurrentTierDisplay()}
                </Font>
                <Font type='Body4' style={styles.recordItemBottom}>
                  현재 티어
                </Font>
              </View>

              <View style={styles.recordItem}>
                <Font
                  type='Head2'
                  style={[
                    styles.recordItemTop,
                    hasRecord
                      ? { color: NEUTRAL.MAIN }
                      : { color: NEUTRAL.GRAY_100 },
                  ]}
                >
                  {hasRecord && weeklyRecord?.weeklyAvgPace
                    ? formatPace(weeklyRecord.weeklyAvgPace)
                    : '-'}
                </Font>
                <Font type='Body4' style={styles.recordItemBottom}>
                  평균 페이스
                </Font>
              </View>

              <View style={styles.recordItem}>
                <Font
                  type='Head2'
                  style={[
                    styles.recordItemTop,
                    hasRecord ? {} : { color: NEUTRAL.GRAY_100 },
                  ]}
                >
                  {hasRecord ? (weeklyRecord?.weeklyCount ?? 0) : '-'}
                </Font>
                <Font type='Body4' style={styles.recordItemBottom}>
                  러닝 횟수
                </Font>
              </View>
            </>
          )}
        </View>
      </GradientBorderCard>

      <TierInfoCard />

      <View style={styles.commentWrapper}>
        <Font type='SubButton' style={styles.comment}>
          {commentMessage}
        </Font>

        <View style={styles.tailOuter} />
        <View style={styles.tailInner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  Icon: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 70,
    marginRight: 20,
  },
  accountIcon: {
    width: 32,
    height: 32,
    marginLeft: 20,
  },
  title: {
    color: NEUTRAL.WHITE,
    marginTop: 30,
    marginLeft: 20,
    lineHeight: 35,
  },
  weeklyRecordWrapper: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  shadowWrapper: {
    borderRadius: BORDER_RADIUS,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  gradientWrapper: {
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  gradientBorder: {
    padding: BORDER_WIDTH,
  },
  gradientInner: {
    backgroundColor: NEUTRAL.BLACK,
    borderRadius: BORDER_RADIUS - BORDER_WIDTH,
    padding: 20,
  },
  weeklyRecordTitle: {
    alignSelf: 'center',
  },
  weeklyRecordTitleText: {
    color: NEUTRAL.GRAY_500,
    marginVertical: 5,
  },
  dividerContainer: {
    marginTop: 10,
    marginBottom: 15,
    flexDirection: 'row',
    height: 1,
    alignItems: 'center',
  },
  recordList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordItem: {
    flexDirection: 'column',
    marginHorizontal: 24,
  },
  recordItemTop: {
    alignSelf: 'center',
    color: NEUTRAL.GRAY_100,
  },
  recordItemBottom: {
    alignSelf: 'center',
    marginTop: 5,
    color: NEUTRAL.GRAY_100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  loadingText: {
    color: NEUTRAL.GRAY_500,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  errorText: {
    color: NEUTRAL.DANGER,
  },
  commentWrapper: {
    alignItems: 'center',
    marginTop: '40%',
  },
  comment: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    justifyContent: 'center',
    textAlign: 'center',
    borderColor: NEUTRAL.MAIN,
    borderWidth: 1,
    borderRadius: 30,
    color: NEUTRAL.GRAY_300,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  tailOuter: {
    position: 'absolute',
    bottom: -9,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: NEUTRAL.MAIN,
  },
  tailInner: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: NEUTRAL.BACKGROUND,
  },
});

export { MainScreen };
