import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from '../../config/api';
import { NEUTRAL } from '../../constants/Colors';
import { getTierIcon, TierCode } from '../../constants/Tiers';
import { useAuth } from '../../contexts/AuthContext';
import { Font } from '../Font';

interface TierInfoCardProps {
  showOnlyWhenHasRecords?: boolean;
  hasRecords?: boolean;
}

interface CurrentTierData {
  tierCode: string;
  tierGrade: string;
}

function TierInfoCard({
  showOnlyWhenHasRecords = false,
  hasRecords = true,
}: TierInfoCardProps) {
  const router = useRouter();
  const { getAccessToken, isOnboardingComplete } = useAuth();
  const [currentTier, setCurrentTier] = useState<CurrentTierData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentTier = async () => {
      try {
        setLoading(true);
        const token = await getAccessToken();

        if (!token) {
          setCurrentTier(null);
          return;
        }

        const response = await fetch(`${BASE_URL}/weekly/tiers/current`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (result.success && result.data) {
          setCurrentTier(result.data);
        } else {
          setCurrentTier(null);
        }
      } catch (error) {
        console.error('현재 티어 조회 실패:', error);
        setCurrentTier(null);
      } finally {
        setLoading(false);
      }
    };

    if (isOnboardingComplete) {
      fetchCurrentTier();
    }
  }, [isOnboardingComplete, getAccessToken]); // fetchCurrentTier를 의존성에서 제거

  const hasEstimatedTier =
    isOnboardingComplete && Boolean(currentTier?.tierCode);

  const handleInfoClick = () => {
    if (hasEstimatedTier) {
      router.push('/tierOverView');
    } else {
      router.push('/startRecord');
    }
  };

  if (showOnlyWhenHasRecords && !hasRecords) {
    return null;
  }

  if (isOnboardingComplete && loading) {
    return (
      <View style={styles.info}>
        <ActivityIndicator size='small' color={NEUTRAL.MAIN} />
        <Font type='Body4' style={styles.loadingText}>
          티어 정보를 불러오는 중...
        </Font>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.info} onPress={handleInfoClick}>
      <View>
        <Font type='Head1'>
          {getTierIcon(currentTier?.tierCode as TierCode) || '🐆'}
        </Font>
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
  loadingText: {
    color: NEUTRAL.GRAY_500,
    marginLeft: 10,
  },
});

export { TierInfoCard };
