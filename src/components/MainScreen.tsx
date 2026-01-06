import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Font } from '../components/Font';
import { NEUTRAL } from '../constants/Colors';
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

      <Font type='Head2' style={styles.title}>
        날쌘돌이님,{'\n'}이번 주도 달려볼까요?
      </Font>

      <View style={styles.weeklyRecord}>
        <View style={styles.weeklyRecordTitle}>
          <Font type='SubButton' style={styles.weeklyRecordTitleText}>
            주간 기록
          </Font>
        </View>

        <View style={styles.recordList}>
          <View style={styles.recordItem}>
            <Font type='Head2' style={styles.recordItemTop}>
              🦊
            </Font>
            <Font type='Body4' style={styles.recordItemBottom}>
              현재 티어
            </Font>
          </View>

          <View style={styles.recordItem}>
            <Font
              type='Head2'
              style={[styles.recordItemTop, { color: NEUTRAL.MAIN }]}
            >
              {`05'32"`}
            </Font>
            <Font type='Body4' style={styles.recordItemBottom}>
              평균 페이스
            </Font>
          </View>

          <View style={styles.recordItem}>
            <Font type='Head2' style={styles.recordItemTop}>
              1
            </Font>
            <Font type='Body4' style={styles.recordItemBottom}>
              러닝 횟수
            </Font>
          </View>
        </View>
      </View>

      <View style={styles.info}>
        <Font type='Head1'>🐆</Font>

        <View style={styles.infoText}>
          <Font type='Body1' style={{ marginBottom: 3 }}>
            달려의 티어를 소개합니다
          </Font>
          <Font type='Body5' style={{ color: NEUTRAL.GRAY_600 }}>
            티어는 월요일마다 새로 시작돼요
          </Font>
        </View>

        <MaterialIcons
          style={[styles.navigateNext, { color: NEUTRAL.GRAY_600 }]}
          name='navigate-next'
          size={34}
        />
      </View>

      <View style={styles.commentWrapper}>
        <Font type='SubButton' style={styles.comment}>
          {commentMessage}
        </Font>

        <View style={styles.tailOuter} />
        <View style={styles.tailInner} />
      </View>
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
    color: NEUTRAL.WHITE,
    marginTop: 30,
    marginLeft: 20,
    lineHeight: 35,
  },
  weeklyRecord: {
    backgroundColor: NEUTRAL.BLACK,
    borderRadius: 30,
    padding: 20,
    marginTop: 50,
    marginHorizontal: 20,
  },
  weeklyRecordTitle: {
    alignSelf: 'center',
  },
  weeklyRecordTitleText: {
    color: NEUTRAL.GRAY_500,
    marginVertical: 5,
  },
  recordList: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopColor: NEUTRAL.GRAY_500,
    borderTopWidth: 2,
  },
  recordItem: {
    flexDirection: 'column',
    marginTop: 15,
  },
  recordItemTop: {
    alignSelf: 'center',
    color: NEUTRAL.GRAY_100,
  },
  recordItemBottom: {
    alignSelf: 'center',
    marginTop: 5,
    color: NEUTRAL.GRAY_100,
  },
  info: {
    flexDirection: 'row',
    backgroundColor: NEUTRAL.GRAY_900,
    borderColor: NEUTRAL.GRAY_800,
    borderRadius: 30,
    marginTop: 30,
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
    borderColor: NEUTRAL.MAIN,
    borderWidth: 1,
    borderRadius: 30,
    color: NEUTRAL.GRAY_300,
    backgroundColor: NEUTRAL.BACKGROUND,
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
    borderTopColor: NEUTRAL.MAIN,
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
    borderTopColor: NEUTRAL.BACKGROUND,
  },
});

export { MainScreen };
