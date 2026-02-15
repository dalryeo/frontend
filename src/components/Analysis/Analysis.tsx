import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { NEUTRAL } from '../../constants/Colors';
import { SortType, useAnalysisRecords } from '../../hooks/useAnalysisRecords';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

import Foundation from '@expo/vector-icons/Foundation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { getPeriodText } from '../../utils/dateUtils';
import {
  filterRecordsByPeriod,
  groupRecordsByDate,
  processRecord,
} from '../../utils/recordUtils';

type PeriodType = 'weekly' | 'monthly' | 'yearly';

function Analysis() {
  const [fontsLoaded] = useAppFonts();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('weekly');
  const [sortType, setSortType] = useState<SortType>('latest');
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const { records, loading, fetchRecords } = useAnalysisRecords();

  const { groupedRecords, periodText } = useMemo(() => {
    if (!Array.isArray(records)) {
      return {
        filteredRecords: [],
        groupedRecords: [],
        periodText: getPeriodText(selectedPeriod),
      };
    }

    const processedRecords = records.map(processRecord);

    const sortedRecords = [...processedRecords].sort((a, b) => {
      switch (sortType) {
        case 'latest':
          return (
            new Date(b.originalDate).getTime() -
            new Date(a.originalDate).getTime()
          );
        case 'pace':
          const aRecord = records.find((r) => r.recordId.toString() === a.id);
          const bRecord = records.find((r) => r.recordId.toString() === b.id);
          return (
            (aRecord?.avgPaceSecPerKm || 0) - (bRecord?.avgPaceSecPerKm || 0)
          );
        case 'distance':
          const aRecordDist = records.find(
            (r) => r.recordId.toString() === a.id,
          );
          const bRecordDist = records.find(
            (r) => r.recordId.toString() === b.id,
          );
          return (
            (bRecordDist?.distanceKm || 0) - (aRecordDist?.distanceKm || 0)
          );
        default:
          return 0;
      }
    });

    const filtered = filterRecordsByPeriod(sortedRecords, selectedPeriod);

    const grouped = groupRecordsByDate(filtered);
    const text = getPeriodText(selectedPeriod);

    return {
      filteredRecords: filtered,
      groupedRecords: grouped,
      periodText: text,
    };
  }, [records, selectedPeriod, sortType]);

  useFocusEffect(
    React.useCallback(() => {
      fetchRecords();
    }, [fetchRecords]),
  );

  if (!fontsLoaded) return null;

  const handlePeriodPress = (period: PeriodType) => {
    setSelectedPeriod(period);
  };

  const handleSortPress = () => {
    setShowBottomSheet(true);
  };

  const handleSortSelect = (sort: SortType) => {
    setSortType(sort);
    setShowBottomSheet(false);
  };

  const getSortLabel = (sort: SortType) => {
    switch (sort) {
      case 'latest':
        return '최신순';
      case 'pace':
        return '페이스 빠른 순';
      case 'distance':
        return '달린 거리 순';
      default:
        return '최신순';
    }
  };

  const renderRecordsByDate = () => {
    if (loading) {
      return (
        <View style={{ marginTop: '50%', alignItems: 'center' }}>
          <ActivityIndicator size='small' color={NEUTRAL.MAIN} />
        </View>
      );
    }

    if (groupedRecords.length === 0) {
      let periodLabel = '';
      switch (selectedPeriod) {
        case 'weekly':
          periodLabel = '이번 주';
          break;
        case 'monthly':
          periodLabel = '이번 달';
          break;
        case 'yearly':
          periodLabel = '올해';
          break;
      }

      return (
        <View style={styles.noRecordContainer}>
          <View style={styles.noRecordContent}></View>
          <Font type='Head3' style={{ color: NEUTRAL.WHITE, marginTop: 30 }}>
            {periodLabel}에 달린 기록이 없어요
          </Font>
          <Font type='Body4' style={{ color: NEUTRAL.GRAY_500, marginTop: 10 }}>
            {periodLabel} 첫 러닝을 기록해보세요!
          </Font>
        </View>
      );
    }

    return groupedRecords.map(([date, recordsForDate]) => (
      <View key={date} style={styles.recordSection}>
        <Font type='Body4' style={styles.dateText}>
          {date}
        </Font>

        {recordsForDate.map((record, index) => (
          <View
            key={record.id}
            style={[
              styles.recordList,
              index > 0 && styles.additionalRecordMargin,
            ]}
          >
            <View style={styles.recordTextContainerLeft}>
              <Font type='Head2' style={styles.paceText}>
                {record.pace}
              </Font>
            </View>

            <View style={styles.recordTextContainerRight}>
              <Font type='Body4' style={styles.recordDetailText}>
                {record.distance}
              </Font>
              <Font type='Body4' style={styles.recordDetailText}>
                {record.duration}
              </Font>
              {record.heartRate > 0 && (
                <View style={styles.heartRateContainer}>
                  <Foundation name='heart' size={18} color={NEUTRAL.DANGER} />
                  <Font type='Body4' style={styles.heartRateText}>
                    {record.heartRate} BPM
                  </Font>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.Icon}>
        <TouchableOpacity onPress={() => router.push('/myPage')}>
          <Image
            source={require('../../../assets/images/Main/accountIcon.png')}
            style={styles.accountIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <Image
            source={require('../../../assets/images/Ranking/home.png')}
            style={styles.accountIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.periodContainer}>
        <TouchableOpacity
          onPress={() => handlePeriodPress('weekly')}
          style={[
            styles.periodButton,
            selectedPeriod === 'weekly' && styles.selectedPeriodButton,
          ]}
        >
          <Font
            type='MainButton'
            style={[
              styles.periodBtnText,
              selectedPeriod === 'weekly' && styles.selectedPeriodText,
            ]}
          >
            주간
          </Font>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePeriodPress('monthly')}
          style={[
            styles.periodButton,
            selectedPeriod === 'monthly' && styles.selectedPeriodButton,
          ]}
        >
          <Font
            type='MainButton'
            style={[
              styles.periodBtnText,
              selectedPeriod === 'monthly' && styles.selectedPeriodText,
            ]}
          >
            월간
          </Font>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handlePeriodPress('yearly')}
          style={[
            styles.periodButton,
            selectedPeriod === 'yearly' && styles.selectedPeriodButton,
          ]}
        >
          <Font
            type='MainButton'
            style={[
              styles.periodBtnText,
              selectedPeriod === 'yearly' && styles.selectedPeriodText,
            ]}
          >
            연간
          </Font>
        </TouchableOpacity>
      </View>

      <View style={styles.periodInfo}>
        <Font type='Body2' style={styles.periodText}>
          {periodText}
        </Font>
        <TouchableOpacity style={styles.arrow} onPress={handleSortPress}>
          <MaterialIcons
            name='compare-arrows'
            size={20}
            color={NEUTRAL.GRAY_500}
            style={{ transform: [{ rotate: '90deg' }] }}
          />
          <Font type='Body4' style={{ color: NEUTRAL.GRAY_500 }}>
            {getSortLabel(sortType)}
          </Font>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderRecordsByDate()}
      </ScrollView>

      <Modal
        visible={showBottomSheet}
        transparent
        animationType='fade'
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowBottomSheet(false)}
        >
          <View style={styles.bottomSheet}>
            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => handleSortSelect('latest')}
            >
              <View style={styles.sortOptionContent}>
                <Font
                  type='Body4'
                  style={[
                    styles.sortOptionText,
                    sortType === 'latest' && styles.selectedSortOptionText,
                  ]}
                >
                  최신순
                </Font>
                {sortType === 'latest' && (
                  <MaterialIcons name='check' size={20} color={NEUTRAL.MAIN} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => handleSortSelect('pace')}
            >
              <View style={styles.sortOptionContent}>
                <Font
                  type='Body4'
                  style={[
                    styles.sortOptionText,
                    sortType === 'pace' && styles.selectedSortOptionText,
                  ]}
                >
                  페이스 빠른 순
                </Font>
                {sortType === 'pace' && (
                  <MaterialIcons name='check' size={20} color={NEUTRAL.MAIN} />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => handleSortSelect('distance')}
            >
              <View style={styles.sortOptionContent}>
                <Font
                  type='Body4'
                  style={[
                    styles.sortOptionText,
                    sortType === 'distance' && styles.selectedSortOptionText,
                  ]}
                >
                  달린 거리 순
                </Font>
                {sortType === 'distance' && (
                  <MaterialIcons name='check' size={20} color={NEUTRAL.MAIN} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
    paddingBottom: 80,
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
  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    paddingHorizontal: 5,
    padding: 3,
    width: '60%',
    height: 50,
    borderRadius: 50,
    backgroundColor: NEUTRAL.GRAY_900,
  },
  periodButton: {
    width: '31%',
    borderRadius: 50,
    marginHorizontal: 3,
  },
  selectedPeriodButton: {
    backgroundColor: NEUTRAL.BLACK,
  },
  periodBtnText: {
    textAlign: 'center',
    paddingVertical: 12,
    color: NEUTRAL.GRAY_600,
  },
  selectedPeriodText: {
    color: NEUTRAL.WHITE,
  },
  periodInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginHorizontal: 20,
  },
  periodText: {
    color: NEUTRAL.GRAY_200,
  },
  arrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scrollView: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  recordSection: {
    marginBottom: 20,
  },
  dateText: {
    color: NEUTRAL.GRAY_400,
    marginBottom: 10,
  },
  recordList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: 25,
    paddingHorizontal: 30,
    backgroundColor: NEUTRAL.BLACK,
  },
  additionalRecordMargin: {
    marginTop: 10,
  },
  recordTextContainerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paceText: {
    color: NEUTRAL.MAIN,
  },
  recordTextContainerRight: {
    alignItems: 'center',
    gap: 2,
  },
  recordDetailText: {
    color: NEUTRAL.GRAY_200,
  },
  heartRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartRateText: {
    color: NEUTRAL.GRAY_200,
    marginLeft: 5,
  },
  noRecordContainer: {
    marginTop: 100,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: NEUTRAL.GRAY_900,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  sortOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortOptionText: {
    color: NEUTRAL.GRAY_300,
  },
  selectedSortOptionText: {
    color: NEUTRAL.MAIN,
  },
});

export { Analysis };
