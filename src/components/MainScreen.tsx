import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FONT_FAMILY } from '../constants/FontFamily';
import { useAppFonts } from '../hooks/useAppFonts';

function MainScreen() {
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();
  const [commentMessage, setCommentMessage] = useState('');

  const COMMENT_MESSAGES = useMemo(
    () => [
      '랜덤 메시지 리스트 작성 필요',
      '첫 러닝을 기록하고 진짜 티어를 확인해보세요 🔥',
    ],
    [],
  );

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * COMMENT_MESSAGES.length);
    setCommentMessage(COMMENT_MESSAGES[randomIndex]);
  }, [COMMENT_MESSAGES]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.Icon}>
        <TouchableOpacity onPress={() => router.push('/record')}>
          <Image
            source={require('../../assets/images/Main/record.png')}
            style={styles.recordIcon}
          />
        </TouchableOpacity>

        <Image
          source={require('../../assets/images/Main/accountIcon.png')}
          style={styles.accountIcon}
        />
      </View>
      <Text style={styles.title}>날쌘돌이님,{'\n'}이번 주도 달려볼까요?</Text>

      <View style={styles.weeklyRecord}>
        <View style={styles.weeklyRecordTitle}>
          <Text style={styles.weeklyRecordTitleText}>주간 기록</Text>
        </View>

        <View style={styles.recordList}>
          <View style={styles.recordItem}>
            <Text style={styles.recordItemTop}>🦊</Text>
            <Text style={styles.recordItemBottom}>현재 티어</Text>
          </View>

          <View style={styles.recordItem}>
            <Text
              style={[
                styles.recordItemTop,
                { color: '#7BF179', marginBottom: 3 },
              ]}
            >
              {`05'32"`}
            </Text>
            <Text style={styles.recordItemBottom}>평균 페이스</Text>
          </View>

          <View style={styles.recordItem}>
            <Text style={[styles.recordItemTop, { marginBottom: 3 }]}>1</Text>
            <Text style={styles.recordItemBottom}>러닝 횟수</Text>
          </View>
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

      <View style={styles.commentWrapper}>
        <Text style={styles.comment}>{commentMessage}</Text>

        <View style={styles.tailOuter} />
        <View style={styles.tailInner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151515',
  },
  Icon: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 70,
    marginRight: 20,
  },
  recordIcon: {
    width: 32,
    height: 32,
  },
  accountIcon: {
    width: 32,
    height: 32,
    marginLeft: 20,
  },
  title: {
    color: 'white',
    fontSize: 32,
    marginTop: 30,
    marginLeft: 20,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    lineHeight: 35,
  },
  weeklyRecord: {
    backgroundColor: '#111111',
    borderRadius: 30,
    padding: 20,
    marginTop: 50,
    marginHorizontal: 20,
  },
  weeklyRecordTitle: {
    alignSelf: 'center',
  },
  weeklyRecordTitleText: {
    color: '#979797',
    fontSize: 16,
    marginVertical: 5,
    fontFamily: FONT_FAMILY.MEDIUM,
  },
  recordList: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: '#979797',
    borderTopWidth: 2,
  },
  recordItem: {
    flexDirection: 'column',
    marginTop: 15,
  },
  recordItemTop: {
    alignSelf: 'center',
    fontSize: 30,
    color: '#f3f3f3',
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  recordItemBottom: {
    alignSelf: 'center',
    marginTop: 5,
    fontSize: 16,
    color: '#f3f3f3',
    fontFamily: FONT_FAMILY.REGULAR,
  },
  info: {
    flexDirection: 'row',
    backgroundColor: '#212121',
    borderColor: '#3c3c3c',
    borderRadius: 30,
    marginTop: 30,
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
  commentWrapper: {
    alignItems: 'center',
    marginTop: '36%',
  },
  comment: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    justifyContent: 'center',
    textAlign: 'center',
    borderColor: '#7BF179',
    borderWidth: 1,
    borderRadius: 30,
    fontSize: 16,
    color: '#dadada',
    backgroundColor: '#151515',
    fontFamily: FONT_FAMILY.MEDIUM,
  },
  tailOuter: {
    position: 'absolute',
    bottom: -9,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#7BF179',
  },
  tailInner: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#151515',
  },
});

export { MainScreen };
