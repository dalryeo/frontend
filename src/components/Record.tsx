import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { FONT_FAMILY } from '../constants/FontFamily';
import { useAppFonts } from '../hooks/useAppFonts';

function Record() {
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();

  const recordData = [
    {
      id: 1,
      icon: '🦊',
      countText: '러닝 3회',
      time: `06'52"`,
      period: '2025. 11. 03 ~ 2025. 11. 09',
    },
    {
      id: 2,
      icon: '🐰',
      countText: '러닝 8회',
      time: `00'90"`,
      period: '2025. 10. 27 ~ 2025. 11. 02',
    },
    {
      id: 3,
      icon: '🐢',
      countText: '러닝 1회',
      time: `14'27"`,
      period: '2025. 09. 22 ~ 2025. 09. 28',
    },
  ];

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Ionicons
          name='chevron-back'
          size={24}
          color='white'
          style={styles.back}
          onPress={() => router.back()}
        />

        <View style={styles.titleWrapper}>
          <Text style={styles.title}>주간 기록</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View>
          <Text style={styles.infoTier}>🐆</Text>
        </View>

        <View style={styles.infoText}>
          <Text style={styles.infoTextTop}>달려의 티어를 소개합니다</Text>
          <Text style={styles.infoTextBottom}>
            티어는 월요일마다 새로 시작돼요
          </Text>
        </View>

        <MaterialIcons
          style={styles.navigateNext}
          name='navigate-next'
          size={34}
          color='#6E6E6E'
        />
      </View>

      {recordData.map((item) => (
        <View key={item.id} style={styles.recordList}>
          <Text style={styles.recordListIcon}>{item.icon}</Text>

          <View style={styles.recordListItem}>
            <Text
              style={[
                styles.recordListText,
                { color: '#FFFFFF', fontSize: 16 },
              ]}
            >
              {item.countText}
            </Text>

            <Text
              style={[
                styles.recordListText,
                {
                  color: '#7BF179',
                  fontSize: 32,
                  fontFamily: FONT_FAMILY.SEMIBOLD,
                },
              ]}
            >
              {item.time}
            </Text>

            <Text
              style={[
                styles.recordListText,
                { color: '#5B5B5B', fontSize: 14 },
              ]}
            >
              {item.period}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151515',
  },
  top: {
    marginTop: 70,
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  back: {
    fontSize: 27,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginRight: 27,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  info: {
    flexDirection: 'row',
    backgroundColor: '#212121',
    borderColor: '#3c3c3c',
    borderRadius: 30,
    marginTop: 50,
    marginHorizontal: 20,
    padding: 20,
  },
  infoTier: {
    fontSize: 40,
  },
  infoText: {
    alignSelf: 'center',
    marginLeft: 15,
  },
  infoTextTop: {
    fontSize: 19,
    color: '#f3f3f3',
    marginBottom: 3,
    fontFamily: FONT_FAMILY.BOLD,
  },
  infoTextBottom: {
    fontSize: 15,
    color: '#6e6e6e',
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  navigateNext: {
    alignSelf: 'center',
    marginLeft: 30,
  },
  recordList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#111111',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
  },
  recordListIcon: {
    fontSize: 50,
    marginRight: 20,
  },
  recordListItem: {
    flexDirection: 'column',
  },
  recordListText: {},
});

export { Record };
