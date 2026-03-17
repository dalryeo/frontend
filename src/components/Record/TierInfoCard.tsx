import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { Font } from '../Font';

function TierInfoCard() {
  const router = useRouter();

  const handleInfoClick = () => {
    router.push('/tierOverView');
  };

  return (
    <TouchableOpacity style={styles.info} onPress={handleInfoClick}>
      <View>
        <Font type='Head1'>🐆</Font>
      </View>

      <View style={styles.infoText}>
        <Font type='Body1' style={styles.infoTextTop}>
          달려의 티어를 소개합니다
        </Font>
        <Font type='Body7' style={styles.infoTextBottom}>
          티어는 월요일마다 새로 시작돼요
        </Font>
      </View>

      <MaterialIcons
        style={[styles.navigateNext, { color: NEUTRAL.GRAY_600 }]}
        name='navigate-next'
        size={34}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  info: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL.GRAY_900,
    borderColor: NEUTRAL.GRAY_800,
    borderRadius: 25,
    marginTop: 30,
    marginHorizontal: 20,
    padding: 20,
  },
  infoText: {
    alignSelf: 'center',
    marginLeft: 15,
    flex: 1,
  },
  infoTextTop: {
    color: NEUTRAL.GRAY_100,
    marginBottom: 3,
  },
  infoTextBottom: {
    color: NEUTRAL.GRAY_600,
  },
  navigateNext: {
    alignSelf: 'center',
  },
});

export { TierInfoCard };
