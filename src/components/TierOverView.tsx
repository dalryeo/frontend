import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Font } from '../components/Font';
import { NEUTRAL } from '../constants/Colors';
import { tiers } from '../data/tiers';
import { useAppFonts } from '../hooks/useAppFonts';
import TierDetail from './TierDetail';

export default function TierOverview() {
  const fontsLoaded = useAppFonts();
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  if (!fontsLoaded) return null;

  const tierList = Object.entries(tiers);

  const tierSystemRules = [
    '달려의 티어는 3km 기준 페이스로 정해져요',
    '각 티어는 Gold/Silver/Bronze 세 단계로 나뉘어요',
    '페이스가 조금만 좋아져도 단계 상승이 바로 보여요',
  ];

  const tierSystemInfoList = [
    '내 티어가 어디쯤인지 동물 티어로 한눈에 확인해요',
    '러닝 성장을 직관적으로 추적할 수 있어요',
    '다음 목표까지 얼마나 남았는지 바로 보여줘요',
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <AntDesign
            style={{ color: NEUTRAL.GRAY_200 }}
            name='close'
            size={24}
          />
        </TouchableOpacity>
        <Font type='Head3' style={styles.title}>
          티어 한눈에 보기
        </Font>

        {tierList.map(([key, tier], index) => (
          <TouchableOpacity
            key={key}
            style={styles.tiers}
            onPress={() => setSelectedTier(key)}
          >
            <Font type='Head1'>{tier.iconSet}</Font>
            <View style={styles.tierInfo}>
              <Font type='Body7' style={styles.tierName}>
                {index + 1}위 {tier.name}
              </Font>
              <Font type='Body1' style={styles.tierInfoText}>
                {tier.title}
              </Font>
            </View>
            <MaterialIcons
              style={[styles.navigateNext, { color: NEUTRAL.GRAY_600 }]}
              name='navigate-next'
              size={34}
            />
          </TouchableOpacity>
        ))}

        <View style={styles.tierSystem}>
          <Font type='Head3' style={styles.title}>
            달려 티어 시스템
          </Font>
          {tierSystemRules.map((rule, idx) => (
            <View key={idx} style={styles.listItem}>
              <Font type='Body4' style={styles.bullet}>
                •
              </Font>
              <Font type='Body4' style={styles.listText}>
                {rule}
              </Font>
            </View>
          ))}
        </View>

        <View style={styles.tierInfoImgContainer}>
          <Image
            source={require('../../assets/images/Tier/TierInfo.png')}
            style={styles.tierInfoImg}
            resizeMode='contain'
          />
        </View>

        <View style={styles.tierSystemInfo}>
          {tierSystemInfoList.map((item, idx) => (
            <View key={idx} style={styles.tierItem}>
              <AntDesign
                style={{ color: NEUTRAL.MAIN }}
                name='check'
                size={16}
              />
              <Font type='SubButton' style={styles.tierSystemInfoText}>
                {item}
              </Font>
            </View>
          ))}
        </View>
      </ScrollView>

      {selectedTier && (
        <TierDetail
          tierKey={selectedTier}
          visible={!!selectedTier}
          onClose={() => setSelectedTier(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginTop: 60,
    marginRight: 20,
  },
  title: {
    color: NEUTRAL.WHITE,
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  tiers: {
    flexDirection: 'row',
    marginTop: 15,
    backgroundColor: NEUTRAL.GRAY_900,
    borderColor: NEUTRAL.GRAY_800,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 20,
  },
  tierInfo: {
    flexDirection: 'column',
    marginLeft: 20,
    justifyContent: 'center',
  },
  tierName: {
    color: NEUTRAL.GRAY_600,
  },
  tierInfoText: {
    color: NEUTRAL.GRAY_100,
    marginTop: 5,
  },
  navigateNext: {
    alignSelf: 'center',
    marginLeft: 'auto',
  },
  tierSystem: {
    marginTop: 30,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
    marginLeft: 20,
  },
  bullet: {
    color: NEUTRAL.GRAY_300,
    marginRight: 8,
  },
  listText: {
    color: NEUTRAL.GRAY_300,
    flexShrink: 1,
  },
  tierInfoImgContainer: {
    width: '100%',
    marginTop: 24,
    marginBottom: 50,
    alignItems: 'center',
  },
  tierInfoImg: {
    width: '90%',
    height: undefined,
    aspectRatio: 1,
  },
  tierSystemInfo: {
    flexDirection: 'column',
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
    borderRadius: 15,
    borderColor: NEUTRAL.MAIN,
    backgroundColor: 'rgba(123, 241, 121, 0.08)',
    borderWidth: 1,
    marginBottom: 50,
  },
  tierItem: {
    flexDirection: 'row',
  },
  tierSystemInfoText: {
    color: NEUTRAL.MAIN,
    marginLeft: 10,
  },
});
