import { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { NEUTRAL } from '../../constants/Colors';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

import Foundation from '@expo/vector-icons/Foundation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type PeriodType = 'weekly' | 'monthly' | 'yearly';
type SortType = 'latest' | 'pace' | 'distance';

interface RecordData {
  id: string;
  date: string;
  tier: string;
  pace: string;
  distance: string;
  duration: string;
  heartRate: number;
}

function Analysis() {
  const [fontsLoaded] = useAppFonts();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('weekly');
  const [sortType, setSortType] = useState<SortType>('latest');
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const mockRecords: RecordData[] = [
    {
      id: '1',
      date: '2026. 01. 16',
      tier: '🦊',
      pace: '05\'16"',
      distance: '2.08km',
      duration: '1:00:00',
      heartRate: 148,
    },
    {
      id: '2',
      date: '2026. 01. 16',
      tier: '🐰',
      pace: '06\'32"',
      distance: '1.85km',
      duration: '35:20',
      heartRate: 142,
    },
    {
      id: '3',
      date: '2026. 01. 14',
      tier: '🦌',
      pace: '04\'58"',
      distance: '5.20km',
      duration: '1:25:30',
      heartRate: 145,
    },
    {
      id: '4',
      date: '2026. 01. 11',
      tier: '🦊',
      pace: '05\'45"',
      distance: '3.50km',
      duration: '1:15:00',
      heartRate: 150,
    },
    {
      id: '5',
      date: '2026. 01. 09',
      tier: '🐰',
      pace: '06\'10"',
      distance: '2.75km',
      duration: '45:30',
      heartRate: 144,
    },
    {
      id: '6',
      date: '2026. 01. 07',
      tier: '🦌',
      pace: '05\'20"',
      distance: '4.80km',
      duration: '1:35:00',
      heartRate: 152,
    },
    {
      id: '7',
      date: '2026. 01. 05',
      tier: '🦊',
      pace: '05\'30"',
      distance: '3.20km',
      duration: '1:10:00',
      heartRate: 149,
    },
    {
      id: '8',
      date: '2026. 01. 03',
      tier: '🐰',
      pace: '06\'05"',
      distance: '2.95km',
      duration: '50:15',
      heartRate: 146,
    },
    {
      id: '9',
      date: '2026. 01. 01',
      tier: '🦌',
      pace: '04\'45"',
      distance: '6.10km',
      duration: '1:45:20',
      heartRate: 155,
    },
    {
      id: '10',
      date: '2026. 01. 20',
      tier: '🦊',
      pace: '05\'25"',
      distance: '3.60km',
      duration: '1:12:30',
      heartRate: 149,
    },
    {
      id: '11',
      date: '2026. 01. 22',
      tier: '🐰',
      pace: '06\'08"',
      distance: '2.90km',
      duration: '48:15',
      heartRate: 144,
    },
  ];

  if (!fontsLoaded) return null;

  const handlePeriodPress = (period: PeriodType) => {
    setSelectedPeriod(period);
    console.log('선택된 기간:', period);
  };

  const handleSortPress = () => {
    setShowBottomSheet(true);
  };

  const handleSortSelect = (sort: SortType) => {
    setSortType(sort);
    setShowBottomSheet(false);
    console.log('선택된 정렬:', sort);
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

  const paceToSeconds = (pace: string) => {
    const match = pace.match(/(\d+)'(\d+)"/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  const distanceToNumber = (distance: string) => {
    return parseFloat(distance.replace('km', ''));
  };

  const getDateRange = (period: PeriodType) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = today;

    switch (period) {
      case 'weekly':
        const dayOfWeek = today.getDay();
        startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;

      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;

      case 'yearly':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;

      default:
        startDate = today;
        endDate = today;
    }

    return {
      start: startDate,
      end: endDate,
      formatted: `${formatDate(startDate)} - ${formatDate(endDate)}`,
    };
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}`;
  };

  const parseDate = (dateString: string) => {
    const parts = dateString.split('. ');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    return new Date(year, month, day);
  };

  const getFilteredRecords = () => {
    const dateRange = getDateRange(selectedPeriod);

    return mockRecords.filter((record) => {
      const recordDate = parseDate(record.date);
      return recordDate >= dateRange.start && recordDate <= dateRange.end;
    });
  };

  const groupRecordsByDate = (records: RecordData[]) => {
    let sortedRecords = [...records];

    switch (sortType) {
      case 'latest':
        sortedRecords.sort((a, b) => {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        break;

      case 'pace':
        sortedRecords.sort((a, b) => {
          return paceToSeconds(a.pace) - paceToSeconds(b.pace);
        });
        break;

      case 'distance':
        sortedRecords.sort((a, b) => {
          return distanceToNumber(b.distance) - distanceToNumber(a.distance);
        });
        break;
    }

    const grouped: { [key: string]: RecordData[] } = {};

    sortedRecords.forEach((record) => {
      if (!grouped[record.date]) {
        grouped[record.date] = [];
      }
      grouped[record.date].push(record);
    });

    const result: [string, RecordData[]][] = [];
    const processedDates = new Set<string>();

    sortedRecords.forEach((record) => {
      if (!processedDates.has(record.date)) {
        processedDates.add(record.date);
        result.push([record.date, grouped[record.date]]);
      }
    });

    return result;
  };

  const renderRecordsByDate = () => {
    const filteredRecords = getFilteredRecords();
    const groupedRecords = groupRecordsByDate(filteredRecords);

    if (groupedRecords.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Font type='Body4' style={styles.emptyText}>
            이 기간에 기록된 러닝이 없습니다
          </Font>
        </View>
      );
    }

    return groupedRecords.map(([date, records]) => (
      <View key={date} style={styles.recordSection}>
        <Font type='Body4' style={styles.dateText}>
          {date}
        </Font>

        {records.map((record, index) => (
          <View
            key={record.id}
            style={[
              styles.recordList,
              index > 0 && styles.additionalRecordMargin,
            ]}
          >
            <View style={styles.recordTextContainerLeft}>
              <Font type='Head2'>{record.tier}</Font>
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
              <View style={styles.heartRateContainer}>
                <Foundation name='heart' size={18} color={NEUTRAL.DANGER} />
                <Font type='Body4' style={styles.heartRateText}>
                  {record.heartRate} BPM
                </Font>
              </View>
            </View>
          </View>
        ))}
      </View>
    ));
  };

  const currentDateRange = getDateRange(selectedPeriod);

  return (
    <View style={styles.container}>
      <View style={styles.Icon}>
        <Image
          source={require('../../../assets/images/Main/accountIcon.png')}
          style={styles.accountIcon}
        />

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
          {currentDateRange.formatted}
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
    marginLeft: 10,
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
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: NEUTRAL.GRAY_500,
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
