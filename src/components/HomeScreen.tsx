import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FONT_FAMILY } from '../constants/FontFamily';
import { useAppFonts } from '../hooks/useAppFonts';

function HomeScreen() {
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Ionicons
        name="chevron-back"
        size={24}
        color="white"
        style={styles.back}
      />

      <Text style={styles.title}>가장 최근에{'\n'}달린 기록을 알려주세요</Text>

      <Text style={styles.subscribe}>
        기록을 바탕으로 <Text style={{ color: '#7BF179' }}>예상 티어</Text>를
        계산해드려요
      </Text>

      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <View>
          <FontAwesome5
            name="running"
            size={28}
            color="white"
            style={[styles.run, { marginTop: 70 }]}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.distanceInput}
              placeholder="5.00"
              placeholderTextColor="#F3F3F3"
              keyboardType="numeric"
            />
            <Text style={styles.unit}>km</Text>
          </View>

          <FontAwesome5
            name="clock"
            size={28}
            color="white"
            style={styles.run}
          />
          <TextInput
            style={styles.distance}
            placeholder="00:40:00"
            placeholderTextColor="#F3F3F3"
            keyboardType="numeric"
          />
        </View>

        <View>
          <Text style={styles.next}>건너뛰기</Text>
          <TouchableOpacity
            style={styles.nextBtn}
            // FIXME: 경로 다시 구성하기
            // onPress={() => router.push('/profile')}
          >
            <Text style={styles.nextBtnText}>다음으로</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151515',
  },
  title: {
    color: 'white',
    fontSize: 28,
    marginTop: 100,
    marginLeft: 20,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    lineHeight: 35,
  },
  subscribe: {
    marginTop: 12,
    fontSize: 16,
    color: '#979797',
    fontFamily: FONT_FAMILY.REGULAR,
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
    color: '#7BF179',
    fontSize: 37,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 12,
    width: '53%',
    borderBottomWidth: 3,
    textAlign: 'center',
    borderBottomColor: '#3c3c3c',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#3c3c3c',
    width: '53%',
    justifyContent: 'center',
    paddingBottom: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  distanceInput: {
    color: '#7BF179',
    fontSize: 37,
    width: '45%',
    marginRight: 10,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    textAlign: 'center',
  },
  unit: {
    color: '#5B5B5B',
    fontSize: 37,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    textAlign: 'center',
  },
  next: {
    color: '#6e6e6e',
    fontSize: 15,
    alignSelf: 'center',
    fontFamily: FONT_FAMILY.REGULAR,
  },
  nextBtn: {
    width: '90%',
    height: 60,
    backgroundColor: '#7BF179',
    borderRadius: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 20,
    lineHeight: 50,
    fontSize: 15,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    color: '#151515',
  },
  nextBtnText: {
    textAlign: 'center',
    lineHeight: 50,
    fontSize: 15,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    color: '#151515',
  },
});

export { HomeScreen };
