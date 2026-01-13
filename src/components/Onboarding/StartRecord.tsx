import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { NEUTRAL } from '../../constants/Colors';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

const PICKER_HEIGHT = 400;

const distanceData = Array.from({ length: 500 }, (_, i) => ({
  value: (i + 1) / 10,
  label: `${((i + 1) / 10).toFixed(1)} km`,
}));

const minuteData = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, '0'),
}));

const secondData = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, '0'),
}));

const hourData = Array.from({ length: 13 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, '0'),
}));

function StartRecord() {
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();

  const [distance, setDistance] = useState<number | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<number | null>(null);

  const [activePicker, setActivePicker] = useState<'distance' | 'time' | null>(
    null,
  );

  const [distanceValue, setDistanceValue] = useState<number>(5.0);
  const [hourValue, setHourValue] = useState<number>(0);
  const [minuteValue, setMinuteValue] = useState<number>(40);
  const [secondValue, setSecondValue] = useState<number>(0);

  const [isClosing, setIsClosing] = useState(false);

  const slideAnim = useRef(new Animated.Value(PICKER_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openPicker = (type: 'distance' | 'time') => {
    if (type === 'distance') {
      setDistanceValue(distance ?? 5.0);
    } else {
      setHourValue(hours ?? 0);
      setMinuteValue(minutes ?? 40);
      setSecondValue(seconds ?? 0);
    }
    setActivePicker(type);
  };

  const formatTime = (h: number, m: number, s: number): string => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (activePicker) {
      slideAnim.setValue(PICKER_HEIGHT);
      backdropAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activePicker, backdropAnim, slideAnim]);

  const closePicker = () => {
    if (isClosing) return;
    setIsClosing(true);

    if (activePicker === 'distance') {
      setDistance(distanceValue);
    } else if (activePicker === 'time') {
      setHours(hourValue);
      setMinutes(minuteValue);
      setSeconds(secondValue);
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: PICKER_HEIGHT,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setActivePicker(null);
        setIsClosing(false);
      }
    });
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

      <View
        style={{
          flex: 0.9,
          justifyContent: 'space-between',
        }}
      >
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
          <Font type='Body4' style={styles.next}>
            건너뛰기
          </Font>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => router.push('/profile')}
          >
            <Font type='MainButton' style={styles.nextBtnText}>
              다음으로
            </Font>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={activePicker !== null} transparent animationType='none'>
        <View style={styles.pickerModalContainer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closePicker}>
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
                  onPress={closePicker}
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
