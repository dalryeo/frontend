import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

import { workoutModule, WorkoutSessionState } from '@/modules/workout';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useWorkout } from '../../hooks/useWorkout';

type ControlState = 'paused' | 'playing' | 'sheet';

function Record() {
  const [fontsLoaded] = useAppFonts();
  const [controlState, setControlState] = useState<ControlState>('paused');

  const {
    metrics,
    sessionState,
    hasAllPermissions,
    isRequesting,
    requestPermissions,
  } = useWorkout();

  const sheetAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(sheetAnim, {
      toValue: controlState === 'sheet' ? 0 : 1,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [controlState, sheetAnim]);

  useEffect(() => {
    switch (sessionState) {
      case WorkoutSessionState.NotStarted:
        setControlState('paused');
        break;
      case WorkoutSessionState.Running:
        setControlState('playing');
        break;
      case WorkoutSessionState.Paused:
        setControlState('sheet');
        break;
    }
  }, [sessionState]);

  if (!fontsLoaded) return null;

  const handleStart = async () => {
    if (!hasAllPermissions) {
      Alert.alert(
        '권한 필요',
        '운동 기록을 위해 Health와 위치 권한이 필요합니다.',
        [
          {
            text: '권한 허용',
            onPress: requestPermissions,
          },
          { text: '취소', style: 'cancel' },
        ],
      );
      return;
    }

    const result = await workoutModule.start();
    if (!result.success) {
      Alert.alert('오류', result.error.message);
    }
  };

  const handlePause = async () => {
    const result = await workoutModule.pause();
    if (!result.success) {
      Alert.alert('오류', result.error.message);
    }
  };

  const handleResume = async () => {
    const result = await workoutModule.resume();
    if (!result.success) {
      Alert.alert('오류', result.error.message);
    } else {
      setControlState('playing');
    }
  };

  const handleEnd = async () => {
    const result = await workoutModule.end();
    if (!result.success) {
      Alert.alert('오류', result.error.message);
    } else {
      await workoutModule.reset();
      setControlState('paused');
    }
  };

  const handlePress = () => {
    if (controlState === 'paused') {
      handleStart();
    } else if (controlState === 'playing') {
      handlePause();
    }
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatPace = (pace: number): string => {
    if (!pace || pace <= 0) return '00\'00"';
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins.toString().padStart(2, '0')}'${secs.toString().padStart(2, '0')}"`;
  };

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 420],
  });

  const overlayOpacity = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View
      style={[
        styles.container,
        controlState === 'sheet' && {
          backgroundColor: NEUTRAL.BACKGROUND,
        },
      ]}
    >
      <View style={styles.topSheet}>
        {[
          {
            value: (metrics.distance / 1000).toFixed(2),
            label: 'KM',
          },
          {
            value: metrics.heartRate
              ? Math.round(metrics.heartRate).toString()
              : '--',
            label: 'BPM',
          },
          {
            value: formatTime(metrics.elapsedTime),
            label: '시간',
          },
        ].map((item, idx) => (
          <View key={idx} style={styles.topKm}>
            <Font type='Head2' style={styles.topKmTextT}>
              {item.value}
            </Font>
            <Font type='Body4' style={styles.topKmTextB}>
              {item.label}
            </Font>
          </View>
        ))}
      </View>

      <View style={styles.midContainer}>
        <Font
          type='Head4'
          style={[
            styles.midText,
            controlState === 'sheet' && { color: NEUTRAL.DARKGREEN },
          ]}
        >
          현재 페이스
        </Font>

        <Font
          type='Record'
          style={[
            styles.recordText,
            controlState === 'sheet' && { color: NEUTRAL.GRAY_800 },
          ]}
        >
          {formatPace(metrics.pace)}
        </Font>

        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.85}
          disabled={isRequesting}
        >
          {controlState === 'paused' ? (
            <View style={styles.playButton}>
              <FontAwesome5 name='play' size={34} color={NEUTRAL.MAIN} />
            </View>
          ) : (
            <View style={styles.playButton}>
              <View style={styles.pauseIcon}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {controlState === 'sheet' && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <TouchableOpacity
            style={styles.overlayBackground}
            activeOpacity={1}
          />

          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: sheetTranslateY }] },
            ]}
          >
            <Font type='Head4' style={styles.sheetTitle}>
              잠깐 쉬는 중이에요 🏃🏻
            </Font>

            <Font type='Body4' style={styles.sheetSubTitle}>
              다시 달릴준비가 되셨나요?{'\n'}
              지금 끝내면 여기까지의 기록이 저장돼요.
            </Font>

            <View style={styles.bottomSheetContainer}>
              <TouchableOpacity
                style={styles.recordEndButton}
                onPress={handleEnd}
                activeOpacity={0.8}
              >
                <View style={styles.iconWrapper}>
                  <View style={styles.recordEndIcon}>
                    <View style={styles.checkIcon}>
                      <View style={styles.checkShort} />
                      <View style={styles.checkLong} />
                    </View>
                  </View>
                </View>
                <Font type='Body1' style={{ color: NEUTRAL.BACKGROUND }}>
                  러닝 완료
                </Font>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.recordEndButton}
                onPress={handleResume}
                activeOpacity={0.8}
              >
                <View style={styles.iconWrapper}>
                  <FontAwesome5
                    name='play'
                    size={30}
                    color={NEUTRAL.BACKGROUND}
                  />
                </View>
                <Font type='Body1' style={{ color: NEUTRAL.BACKGROUND }}>
                  러닝 재개
                </Font>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NEUTRAL.MAIN },
  topSheet: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL.GRAY_900,
    height: '23%',
    paddingTop: '28%',
    paddingHorizontal: '10%',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  topKm: { flex: 1, alignItems: 'center' },
  topKmTextT: { lineHeight: 32, color: NEUTRAL.WHITE },
  topKmTextB: { lineHeight: 32, color: NEUTRAL.MAIN },
  midContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  midText: { color: NEUTRAL.DARKGREEN },
  recordText: { marginTop: 8, color: NEUTRAL.BLACK },
  playButton: {
    marginTop: '45%',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: NEUTRAL.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: { flexDirection: 'row', gap: 10 },
  pauseBar: {
    width: 8,
    height: 36,
    borderRadius: 6,
    backgroundColor: NEUTRAL.MAIN,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheet: {
    height: '42%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: NEUTRAL.GRAY_900,
  },
  sheetTitle: { alignSelf: 'center', color: NEUTRAL.WHITE },
  sheetSubTitle: {
    marginTop: 12,
    lineHeight: 23,
    textAlign: 'center',
    color: NEUTRAL.GRAY_500,
  },
  bottomSheetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  recordEndButton: {
    marginTop: 30,
    width: 160,
    height: 160,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: NEUTRAL.MAIN,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  recordEndIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: NEUTRAL.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: { width: 35, height: 25 },
  checkShort: {
    position: 'absolute',
    width: 4,
    height: 14,
    borderRadius: 2,
    left: 9,
    top: 9,
    transform: [{ rotate: '-45deg' }],
    backgroundColor: NEUTRAL.MAIN,
  },
  checkLong: {
    position: 'absolute',
    width: 4,
    height: 20,
    borderRadius: 2,
    left: 19,
    top: 3,
    transform: [{ rotate: '45deg' }],
    backgroundColor: NEUTRAL.MAIN,
  },
});

export { Record };
