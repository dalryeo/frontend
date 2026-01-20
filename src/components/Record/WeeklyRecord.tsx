import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

function WeeklyRecord() {
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();
  const { tierData } = useAuth();

  const hasEstimatedTier = tierData && tierData.tierCode;

  const handleInfoClick = () => {
    if (hasEstimatedTier) {
      router.push('/tierOverView');
    } else {
      router.push('/startRecord');
    }
  };

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

  console.log('🔍 WeeklyRecord - 예상 티어 데이터:', tierData);
  console.log('🔍 WeeklyRecord - 예상 티어 계산 완료:', hasEstimatedTier);

  return (
    <View style={styles.container}>
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

      <TouchableOpacity style={styles.info} onPress={handleInfoClick}>
        <View>
          <Font type='Head1'>{hasEstimatedTier ? '🐆' : '🤔'}</Font>
        </View>

        <View style={styles.infoText}>
          <Font type='Body1' style={styles.infoTextTop}>
            {hasEstimatedTier
              ? '달려의 티어를 소개합니다'
              : '내 러닝 실력, 무슨 티어일까?'}
          </Font>
          <Font type='Body7' style={styles.infoTextBottom}>
            {hasEstimatedTier
              ? '티어는 월요일마다 새로 시작돼요'
              : '달리기 전 예상 티어를 확인할 수 있어요'}
          </Font>
        </View>

        <MaterialIcons
          style={[styles.navigateNext, { color: NEUTRAL.GRAY_600 }]}
          name='navigate-next'
          size={34}
        />
      </TouchableOpacity>

      {recordData.map((item) => (
        <View key={item.id} style={styles.recordList}>
          <Font type='Head1' style={styles.recordListIcon}>
            {item.icon}
          </Font>

          <View style={styles.recordListItem}>
            <Font
              type='Body4'
              style={[styles.recordListText, { color: NEUTRAL.WHITE }]}
            >
              {item.countText}
            </Font>

            <Font
              type='Head2'
              style={[
                styles.recordListText,
                {
                  color: NEUTRAL.MAIN,
                },
              ]}
            >
              {item.time}
            </Font>

            <Font
              type='Body7'
              style={[styles.recordListText, { color: NEUTRAL.GRAY_700 }]}
            >
              {item.period}
            </Font>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  top: {
    marginTop: 70,
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginRight: 27,
  },
  title: {
    color: NEUTRAL.WHITE,
  },
  info: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL.GRAY_900,
    borderColor: NEUTRAL.GRAY_800,
    borderRadius: 30,
    marginTop: 50,
    marginHorizontal: 20,
    padding: 20,
  },
  infoText: {
    alignSelf: 'center',
    marginLeft: 15,
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
    marginLeft: 65,
  },
  recordList: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: NEUTRAL.BLACK,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
  },
  recordListIcon: {
    marginRight: 20,
  },
  recordListItem: {
    flexDirection: 'column',
  },
  recordListText: {},
});

export { WeeklyRecord };
