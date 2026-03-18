import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { getTierIcon, TierCode } from '../../constants/Tiers';
import { useAppFonts } from '../../hooks/useAppFonts';
import { useWeeklyData } from '../../hooks/useWeeklyData';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { Font } from '../Font';
import { TierInfoCard } from './TierInfoCard';

function WeeklyRecord() {
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();

  const { weeklyDataList, loading, refetch } = useWeeklyData();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const formatPace = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}'${sec.toString().padStart(2, '0')}"`;
  };

  if (!fontsLoaded || loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Font type='Body4' style={{ color: NEUTRAL.GRAY_500 }}>
          주간 기록을 불러오는 중...
        </Font>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 타이틀 */}
      <View style={styles.top}>
        <Ionicons
          style={{ color: NEUTRAL.WHITE }}
          name='chevron-back'
          size={24}
          onPress={() => router.back()}
        />
        <View style={styles.titleWrapper}>
          <Font type='Head5' style={styles.title}>
            주간 기록
          </Font>
        </View>
      </View>

      {/* TierInfoCard는 기록이 있을 때만 보여줌 */}
      {weeklyDataList.length > 0 && <TierInfoCard />}

      {/* 주간 기록 카드 */}
      {weeklyDataList.length > 0 ? (
        weeklyDataList.map((item, idx) => {
          const periodText = `${formatDateForDisplay(item.weekStart)} ~ ${formatDateForDisplay(item.weekEnd)}`;

          return (
            <View key={idx} style={styles.recordList}>
              <Font type='Head1' style={styles.recordListIcon}>
                {getTierIcon(item.tierCode as TierCode)}
              </Font>
              <View style={styles.recordListItem}>
                <Font type='Body4' style={{ color: NEUTRAL.WHITE }}>
                  {`러닝 ${item.runCount}회`}
                </Font>
                <Font type='Head2' style={{ color: NEUTRAL.MAIN }}>
                  {formatPace(item.averagePace)}
                </Font>
                <Font type='Body7' style={{ color: NEUTRAL.GRAY_700 }}>
                  {periodText}
                </Font>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.noRecordContainer}>
          <View style={styles.noRecordContent}></View>
          <Font type='Head3' style={{ color: NEUTRAL.WHITE, marginTop: 30 }}>
            이번 달에 달린 기록이 없어요
          </Font>
          <Font type='Body4' style={{ color: NEUTRAL.GRAY_500, marginTop: 10 }}>
            이번 달 첫 러닝을 기록하러 가볼까요?
          </Font>
          <View
            style={styles.noRecordButton}
            onTouchEnd={() => router.push('/countDown')}
          >
            <Font type='MainButton' style={{ color: NEUTRAL.BLACK }}>
              달려 기록하러 가기 {`->`}
            </Font>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NEUTRAL.BACKGROUND },
  top: {
    paddingTop: 70,
    paddingBottom: 20,
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: NEUTRAL.BLACK,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginRight: 27,
  },
  title: { color: NEUTRAL.WHITE },
  recordList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: NEUTRAL.GRAY_700,
    backgroundColor: NEUTRAL.BLACK,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
  },
  recordListIcon: { marginRight: 20, fontSize: 40 },
  recordListItem: { flexDirection: 'column' },
  noRecordContainer: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecordContent: {
    width: 164,
    height: 164,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242424',
  },
  noRecordButton: {
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 100,
    backgroundColor: NEUTRAL.MAIN,
    borderRadius: 50,
  },
});

export { WeeklyRecord };
