import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { NEUTRAL } from '../../constants/Colors';
import { getProfileImageSource } from '../../constants/Images';
import { UserGuideKey } from '../../data/userGuideData';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';
import { ConfirmModal } from './ConfirmModal';
import { VersionModal } from './VersionModal';

import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import {
  logout as logoutAPI,
  withdraw as withdrawAPI,
} from '../../services/authService';

import { getOnboardingData } from '../../services/profileService';

function MyPage() {
  const [fontsLoaded] = useAppFonts();
  const [nickname, setNickname] = useState('');
  const [displayProfileImage, setDisplayProfileImage] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawConfirmModalVisible, setWithdrawConfirmModalVisible] =
    useState(false);
  const { getAccessToken, logout } = useAuth();

  const currentVersion = 'v0.0.1';
  const latestVersion = 'v0.0.1';

  const menuList = [
    {
      id: 1,
      title: '서비스 이용약관',
      type: 'navigate',
      guideKey: 'terms' as UserGuideKey,
    },
    {
      id: 2,
      title: '개인정보 처리 방침',
      type: 'navigate',
      guideKey: 'privacy' as UserGuideKey,
    },
    { id: 3, title: '버전 정보', type: 'version', version: currentVersion },
    { id: 4, title: '로그아웃', type: 'logout' },
    { id: 5, title: '회원탈퇴', type: 'withdraw' },
  ];

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const token = await getAccessToken();
          if (!token) {
            setIsLoading(false);
            return;
          }

          const data = await getOnboardingData(token);
          setNickname(data.nickname);
          setDisplayProfileImage(data.displayProfileImage);
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadUserData();
    }, [getAccessToken]),
  );

  const handleMenuPress = (item: (typeof menuList)[0]) => {
    if (item.type === 'navigate' && item.guideKey) {
      router.push({
        pathname: '/userGuide',
        params: { guideKey: item.guideKey },
      });
    } else if (item.type === 'version') {
      setVersionModalVisible(true);
    } else if (item.type === 'logout') {
      setLogoutModalVisible(true);
    } else if (item.type === 'withdraw') {
      setWithdrawModalVisible(true);
    }
  };

  const handleLogout = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return;
      }

      await logoutAPI(token);
      await logout();

      setLogoutModalVisible(false);
      router.replace('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      setLogoutModalVisible(false);
      Alert.alert(
        '오류',
        error instanceof Error ? error.message : '로그아웃에 실패했습니다.',
      );
    }
  };

  const handleWithdrawFirstConfirm = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        return;
      }

      await withdrawAPI(token);

      setWithdrawModalVisible(false);
      setTimeout(() => {
        setWithdrawConfirmModalVisible(true);
      }, 300);
    } catch (error) {
      console.error('회원탈퇴 실패:', error);
      setWithdrawModalVisible(false);
      Alert.alert(
        '오류',
        error instanceof Error ? error.message : '회원탈퇴에 실패했습니다.',
      );
    }
  };

  const handleWithdrawComplete = async () => {
    await logout();
    setWithdrawConfirmModalVisible(false);
    router.replace('/login');
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Ionicons
          name='chevron-back'
          size={24}
          style={[styles.back, { color: NEUTRAL.WHITE }]}
          onPress={() => router.back()}
        />
        <Font type='Head5' style={styles.title}>
          My
        </Font>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.profileImg}>
          <Image
            source={
              displayProfileImage
                ? getProfileImageSource(displayProfileImage)
                : undefined
            }
            style={styles.profileImg}
            resizeMode='contain'
          />
        </View>
        <TouchableOpacity
          style={{ alignItems: 'center', flexDirection: 'row' }}
          onPress={() => router.push('/profileEdit')}
        >
          {isLoading ? (
            <ActivityIndicator
              size='small'
              color={NEUTRAL.MAIN}
              style={{ marginLeft: 25 }}
            />
          ) : (
            <Font type='Head5' style={styles.profileText}>
              {nickname}님
            </Font>
          )}
          <MaterialIcons
            style={{ color: NEUTRAL.GRAY_500 }}
            name='navigate-next'
            size={30}
          />
        </TouchableOpacity>
      </View>

      {menuList.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.list}
          onPress={() => handleMenuPress(item)}
        >
          <View style={styles.listTitle}>
            <View style={styles.listIcon}></View>
            <Font type='Body2' style={{ color: NEUTRAL.GRAY_300 }}>
              {item.title}
            </Font>
          </View>

          {item.type === 'navigate' && (
            <MaterialIcons
              style={{ color: NEUTRAL.GRAY_500 }}
              name='navigate-next'
              size={30}
            />
          )}

          {item.type === 'version' && (
            <Font type='Body2' style={{ color: NEUTRAL.GRAY_500 }}>
              ({item.version})
            </Font>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.feedback}>
        <View>
          <Font type='Head1'>💡</Font>
        </View>

        <View style={styles.feedbackText}>
          <Font type='Body4' style={{ color: NEUTRAL.GRAY_300 }}>
            불편하신 점이 있나요?{'\n'}오픈카톡으로 빠르게 도와드릴게요!
          </Font>
          <Font type='Body7' style={{ color: '#2D73FF' }}>
            https://open.kakao.com/o/sgQw0dhi
          </Font>
        </View>
      </View>

      <VersionModal
        visible={versionModalVisible}
        onClose={() => setVersionModalVisible(false)}
        currentVersion={currentVersion}
        latestVersion={latestVersion}
      />

      <ConfirmModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
        title='로그아웃 하시겠어요?'
        cancelText='아니요, 다음에 할게요.'
        confirmText='네, 로그아웃 할게요.'
      />

      <ConfirmModal
        visible={withdrawModalVisible}
        onClose={() => setWithdrawModalVisible(false)}
        onConfirm={handleWithdrawFirstConfirm}
        title='정말 달려를 떠나시겠어요?'
        description={
          '탈퇴하면 지금까지의 러닝 기록·티어·성장\n데이터가 모두 삭제돼요. 삭제된 정보는\n다시 되돌릴 수 없어요.'
        }
        cancelText='아니요, 다음에 할게요.'
        confirmText='네, 탈퇴 할게요.'
      />

      <ConfirmModal
        visible={withdrawConfirmModalVisible}
        onClose={handleWithdrawComplete}
        onConfirm={handleWithdrawComplete}
        title='회원탈퇴를 완료했어요.'
        confirmText='확인'
        singleButton={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.GRAY_900,
  },
  titleContainer: {
    alignContent: 'center',
    paddingTop: 75,
    paddingBottom: 20,
    backgroundColor: NEUTRAL.BLACK,
  },
  back: {
    position: 'absolute',
    top: 75,
    left: 10,
  },
  title: {
    color: NEUTRAL.WHITE,
    alignSelf: 'center',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    marginBottom: 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: NEUTRAL.BLACK,
  },
  profileImg: {
    width: 110,
    height: 110,
    padding: 20,
    borderRadius: 55,
    backgroundColor: NEUTRAL.MAIN,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    marginLeft: 25,
    color: NEUTRAL.WHITE,
  },
  list: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 15,
    justifyContent: 'space-between',
  },
  listTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    width: 22,
    height: 22,
    marginRight: 20,
    borderRadius: 50,
    backgroundColor: NEUTRAL.GRAY_800,
  },
  feedback: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 130,
    marginBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: NEUTRAL.GRAY_800,
    borderWidth: 1,
    borderColor: NEUTRAL.GRAY_700,
    borderRadius: 25,
  },
  feedbackText: {
    marginLeft: 20,
    gap: 7,
  },
});

export { MyPage };
