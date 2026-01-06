import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { Font } from '../components/Font';
import { NEUTRAL } from '../constants/Colors';
import { FONT_FAMILY } from '../constants/FontFamily';
import { useAppFonts } from '../hooks/useAppFonts';

function StartRecord() {
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();

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
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.distanceInput,
                {
                  fontFamily: FONT_FAMILY.SEMIBOLD,
                  fontSize: 34,
                },
              ]}
              placeholder='5.00'
              placeholderTextColor={NEUTRAL.GRAY_100}
              keyboardType='numeric'
            />
            <Font type='Head2' style={styles.unit}>
              km
            </Font>
          </View>

          <FontAwesome5
            name='clock'
            size={28}
            style={[styles.run, { color: NEUTRAL.WHITE }]}
          />
          <TextInput
            style={[
              styles.distance,
              {
                fontFamily: FONT_FAMILY.SEMIBOLD,
                fontSize: 34,
              },
            ]}
            placeholder='00:40:00'
            placeholderTextColor={NEUTRAL.GRAY_100}
            keyboardType='numeric'
          />
        </View>

        <View>
          <Font type='Body4' style={styles.next}>
            건너뛰기
          </Font>
          <TouchableOpacity
            style={styles.nextBtn}
            // FIXME: 경로 다시 구성하기
            onPress={() => router.push('/profile')}
          >
            <Font type='MainButton' style={styles.nextBtnText}>
              다음으로
            </Font>
          </TouchableOpacity>
        </View>
      </View>
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
  distance: {
    color: NEUTRAL.MAIN,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 12,
    width: '53%',
    borderBottomWidth: 3,
    textAlign: 'center',
    borderBottomColor: NEUTRAL.GRAY_800,
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
  distanceInput: {
    color: NEUTRAL.MAIN,
    width: '45%',
    marginRight: 10,
    textAlign: 'center',
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
});

export { StartRecord };
