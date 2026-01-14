import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { NEUTRAL } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAppFonts } from '../../hooks/useAppFonts';
import { estimateTier } from '../../services/authService';
import { Font } from '../Font';

import {
  distanceData,
  hourData,
  minuteData,
  secondData,
} from '../../utils/pickerData';
import { calculatePaceSecPerKm, formatTime } from '../../utils/timeFormat';

import { usePickerAnimation } from '../../hooks/usePickerAnimation';
import { useRunRecordForm } from '../../hooks/useRunRecordForm';

function StartRecord() {
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();
  const { setTierData, getAccessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    distance,
    hours,
    minutes,
    seconds,
    activePicker,
    distanceValue,
    setDistanceValue,
    hourValue,
    setHourValue,
    minuteValue,
    setMinuteValue,
    secondValue,
    setSecondValue,
    isClosing,
    setIsClosing,
    openPicker,
    applyPickerValues,
    closePicker: closePickerForm,
  } = useRunRecordForm();

  const {
    slideAnim,
    backdropAnim,
    closePicker: animateClose,
  } = usePickerAnimation(activePicker);

  const handleNext = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (distance && hours !== null && minutes !== null && seconds !== null) {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          Alert.alert('오류', '인증 토큰이 없습니다.');
          return;
        }

        const paceSecPerKm = calculatePaceSecPerKm(
          hours,
          minutes,
          seconds,
          distance,
        );
        const tierResult = await estimateTier(
          distance,
          paceSecPerKm,
          accessToken,
        );
        await setTierData(tierResult);
      } else {
        await setTierData(null);
      }
      router.push('/profile');
    } catch (error) {
      console.error('티어 계산 오류:', error);
      Alert.alert('오류', '티어 계산 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await setTierData(null);
      router.push('/profile');
    } catch (error) {
      console.error('건너뛰기 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePicker = async () => {
    if (isClosing) return;
    setIsClosing(true);

    applyPickerValues();
    await animateClose();
    closePickerForm();
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Ionicons
        name='chevron-back'
        size={24}
        style={[styles.back, { color: NEUTRAL.WHITE }]}
        onPress={() => router.back()}
      />

      <Font type='Head2' style={styles.title}>
        가장 최근에{'\n'}달린 기록을 알려주세요
      </Font>

      <Font type='Body2' style={styles.subscribe}>
        기록을 바탕으로{' '}
        <Font type='Body2' style={{ color: NEUTRAL.MAIN }}>
          예상 티어
        </Font>
        를 계산해드려요
      </Font>

      <View style={styles.content}>
        <View>
          <FontAwesome5
            name='running'
            size={28}
            style={[styles.run, { marginTop: 70, color: NEUTRAL.WHITE }]}
          />
          <Pressable
            style={styles.inputRow}
            onPress={() => openPicker('distance')}
          >
            <Font
              type='Head2'
              style={[styles.distanceText, !distance && styles.placeholder]}
            >
              {distance ? distance.toFixed(1) : '5.00'}
            </Font>
            <Font type='Head2' style={styles.unit}>
              km
            </Font>
          </Pressable>

          <FontAwesome5
            name='clock'
            size={28}
            style={[styles.run, { color: NEUTRAL.WHITE }]}
          />
          <Pressable
            style={styles.timeContainer}
            onPress={() => openPicker('time')}
          >
            <Font
              type='Head2'
              style={[
                styles.timeText,
                !hours && !minutes && !seconds && styles.placeholder,
              ]}
            >
              {hours !== null && minutes !== null && seconds !== null
                ? formatTime(hours, minutes, seconds)
                : '00:40:00'}
            </Font>
          </Pressable>
        </View>

        <View>
          <Pressable onPress={handleSkip}>
            <Font type='Body4' style={styles.next}>
              건너뛰기
            </Font>
          </Pressable>
          <TouchableOpacity
            style={[styles.nextBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            <Font type='MainButton' style={styles.nextBtnText}>
              {isSubmitting ? '계산 중...' : '다음으로'}
            </Font>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={activePicker !== null} transparent animationType='none'>
        <View style={styles.pickerModalContainer}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleClosePicker}
          >
            <Animated.View
              style={[styles.pickerBackdrop, { opacity: backdropAnim }]}
            />
          </Pressable>

          <Animated.View
            style={[
              styles.pickerSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.pickerSheetContent}>
              <View style={styles.pickerHeader}>
                <Font type='Body4' style={styles.pickerTitle}>
                  {activePicker === 'distance' ? '거리' : '시간'}
                </Font>
                <Pressable
                  onPress={handleClosePicker}
                  hitSlop={10}
                  style={styles.pickerDoneBtn}
                >
                  <Font type='Body4' style={styles.pickerDone}>
                    완료
                  </Font>
                </Pressable>
              </View>

              <View style={styles.wheelPickerWrapper}>
                {activePicker === 'distance' ? (
                  <WheelPicker
                    data={distanceData}
                    value={distanceValue}
                    onValueChanged={({ item: { value } }) =>
                      setDistanceValue(value)
                    }
                    itemTextStyle={styles.pickerItemText}
                  />
                ) : activePicker === 'time' ? (
                  <View style={styles.timePickerContainer}>
                    <View style={styles.timePickerSection}>
                      <Font type='Body4' style={styles.timeLabel}>
                        시
                      </Font>
                      <WheelPicker
                        data={hourData}
                        value={hourValue}
                        onValueChanged={({ item: { value } }) =>
                          setHourValue(value)
                        }
                        itemTextStyle={styles.pickerItemText}
                      />
                    </View>
                    <View style={styles.timePickerSection}>
                      <Font type='Body4' style={styles.timeLabel}>
                        분
                      </Font>
                      <WheelPicker
                        data={minuteData}
                        value={minuteValue}
                        onValueChanged={({ item: { value } }) =>
                          setMinuteValue(value)
                        }
                        itemTextStyle={styles.pickerItemText}
                      />
                    </View>
                    <View style={styles.timePickerSection}>
                      <Font type='Body4' style={styles.timeLabel}>
                        초
                      </Font>
                      <WheelPicker
                        data={secondData}
                        value={secondValue}
                        onValueChanged={({ item: { value } }) =>
                          setSecondValue(value)
                        }
                        itemTextStyle={styles.pickerItemText}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  content: {
    flex: 0.93,
    justifyContent: 'space-between',
  },
  title: {
    color: NEUTRAL.WHITE,
    marginTop: 100,
    marginLeft: 20,
    lineHeight: 35,
  },
  subscribe: {
    marginTop: 12,
    color: NEUTRAL.GRAY_500,
    marginLeft: 20,
  },
  back: {
    top: 75,
    left: 10,
  },
  run: {
    alignContent: 'center',
    alignSelf: 'center',
    marginTop: 30,
  },
  timeContainer: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 12,
    width: '53%',
    borderBottomWidth: 3,
    borderBottomColor: NEUTRAL.GRAY_800,
    alignItems: 'center',
  },
  timeText: {
    color: NEUTRAL.MAIN,
    textAlign: 'center',
    fontSize: 34,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderBottomWidth: 3,
    borderBottomColor: NEUTRAL.GRAY_800,
    width: '53%',
    justifyContent: 'center',
    paddingBottom: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  distanceText: {
    color: NEUTRAL.MAIN,
    marginRight: 10,
    textAlign: 'center',
    fontSize: 34,
  },
  placeholder: {
    color: NEUTRAL.GRAY_100,
  },
  unit: {
    color: NEUTRAL.GRAY_700,
    textAlign: 'center',
  },
  next: {
    color: NEUTRAL.GRAY_600,
    alignSelf: 'center',
  },
  nextBtn: {
    width: '90%',
    height: 60,
    backgroundColor: NEUTRAL.MAIN,
    borderRadius: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    lineHeight: 50,
    marginTop: 10,
    color: NEUTRAL.BACKGROUND,
  },
  nextBtnText: {
    textAlign: 'center',
    lineHeight: 50,
    color: NEUTRAL.BACKGROUND,
  },
  pickerModalContainer: {
    flex: 1,
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  pickerSheetContent: {
    backgroundColor: NEUTRAL.GRAY_900,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.GRAY_800,
  },
  pickerTitle: {
    color: NEUTRAL.WHITE,
  },
  pickerDoneBtn: {
    position: 'absolute',
    right: 16,
  },
  pickerDone: {
    color: NEUTRAL.MAIN,
  },
  wheelPickerWrapper: {
    overflow: 'hidden',
    paddingVertical: 20,
  },
  pickerItemText: {
    color: NEUTRAL.WHITE,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timePickerSection: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    color: NEUTRAL.GRAY_500,
    marginBottom: 10,
  },
});

export { StartRecord };
