import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
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

import { getDisplayName } from '../../utils/displayUtils';
import { formatPace, getTierEmoji } from '../../utils/paceFormat';

import { useRandomMessage } from '../../hooks/useRandomMessage';
import { generateGradientSegments } from '../../utils/gradientUtils';

function MainScreen() {
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();
  const { user } = useAuth();
  const { weeklyRecord, loading, error } = useWeeklyRecord();

  const commentMessage = useRandomMessage();

  if (!fontsLoaded) return null;

  const displayName = getDisplayName(user);
  const gradientSegments = generateGradientSegments();

  const hasRecord =
    weeklyRecord &&
    typeof weeklyRecord === 'object' &&
    !('code' in weeklyRecord) &&
    weeklyRecord.weeklyCount > 0;

  // console.log('🔍 MainScreen - 현재 사용자:', user);
  // console.log('🔍 MainScreen - 주간 기록:', weeklyRecord);
  // console.log('🔍 MainScreen - 기록 존재 여부:', hasRecord);

  return (
    <View style={styles.container}>
      <View style={styles.Icon}>
        <TouchableOpacity onPress={() => router.push('/weeklyRecord')}>
          <Image
            source={require('../../../assets/images/Main/record.png')}
            style={styles.recordIcon}
          />
        </TouchableOpacity>

        <Image
          source={require('../../../assets/images/Main/accountIcon.png')}
          style={styles.accountIcon}
        />
      </View>

      <Font type='Head2' style={styles.title}>
        {displayName}님,{'\n'}이번 주도 달려볼까요?
      </Font>

      <View style={styles.weeklyRecord}>
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
                  {hasRecord ? getTierEmoji(weeklyRecord.currentTier) : '-'}
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
      </View>

      <View style={styles.info}>
        <Font type='Head1'>🐆</Font>

        <View style={styles.infoText}>
          <Font type='Body1' style={{ marginBottom: 3 }}>
            달려의 티어를 소개합니다
          </Font>
          <Font type='Body7' style={{ color: NEUTRAL.GRAY_600 }}>
            티어는 월요일마다 새로 시작돼요
          </Font>
        </View>

        <MaterialIcons
          style={[styles.navigateNext, { color: NEUTRAL.GRAY_600 }]}
          name='navigate-next'
          size={34}
        />
      </View>

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
  recordIcon: {
    width: 32,
    height: 32,
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
  weeklyRecord: {
    backgroundColor: NEUTRAL.BLACK,
    borderRadius: 30,
    padding: 20,
    marginTop: 50,
    marginHorizontal: 20,
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
    marginTop: 15,
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
  info: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL.GRAY_900,
    borderColor: NEUTRAL.GRAY_800,
    borderRadius: 30,
    marginTop: 30,
    marginHorizontal: 20,
    padding: 20,
  },
  infoText: {
    alignSelf: 'center',
    marginLeft: 15,
  },
  navigateNext: {
    alignSelf: 'center',
    marginLeft: 65,
  },
  commentWrapper: {
    alignItems: 'center',
    marginTop: '36%',
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
