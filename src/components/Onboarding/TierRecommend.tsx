import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { tiers } from '../../data/tiers';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

export default function TierRecommend() {
  const fontsLoaded = useAppFonts();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [tierKey, setTierKey] = useState<keyof typeof tiers>('husky');

  const changeTier = (key: keyof typeof tiers) => {
    setTierKey(key);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    });
  };

  if (!fontsLoaded) return null;

  const tierData = tiers[tierKey];

  const tierOrderActual: (keyof typeof tiers)[] = [
    'cheetah',
    'deer',
    'husky',
    'fox',
    'gorani',
    'sheep',
    'rabbit',
    'panda',
    'duck',
    'turtle',
  ];

  const currentIndex = tierOrderActual.indexOf(tierKey);

  const nextTierKey =
    currentIndex < tierOrderActual.length - 1
      ? tierOrderActual[currentIndex + 1]
      : null;

  const prevTierKey =
    currentIndex > 0 ? tierOrderActual[currentIndex - 1] : null;

  const nextTierData = nextTierKey ? tiers[nextTierKey] : null;
  const prevTierData = prevTierKey ? tiers[prevTierKey] : null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Font type='Head2' style={styles.title}>
          {tierData.title}
        </Font>
        <Font type='Body3' style={styles.subscribe}>
          {tierData.subtitle}
        </Font>

        <View style={styles.profileImg} />

        {tierData.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Font type='Head5' style={styles.sectionTitle}>
              {section.icon} {section.title}
            </Font>

            <View style={styles.listSection}>
              {section.items.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <Font type='Body4' style={styles.bullet}>
                    •
                  </Font>
                  <Font type='Body4' style={styles.listText}>
                    {item}
                  </Font>
                </View>
              ))}
            </View>
          </View>
        ))}

        {nextTierData && nextTierKey && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => changeTier(nextTierKey)}
          >
            <ImageBackground
              source={require('../../../assets/images/Tier/nextTier.png')}
              style={styles.nextTierSection}
              imageStyle={styles.nextTierBackground}
            >
              <View style={styles.nextTier}>
                <Font type='Head1'>{nextTierData.iconSet}</Font>

                <View style={styles.nextTierTextContainer}>
                  <Font type='Body7' style={styles.NextTierText}>
                    다음 티어, {nextTierData.name}
                  </Font>
                  <Font type='Body1' style={styles.NextTierTitle}>
                    {nextTierData.title}
                  </Font>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}

        {prevTierData && prevTierKey && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => changeTier(prevTierKey)}
          >
            <ImageBackground
              source={require('../../../assets/images/Tier/prevTier.png')}
              style={styles.prevTierSection}
              imageStyle={styles.prevTierBackground}
            >
              <View style={styles.prevTier}>
                <Font type='Head1'>{prevTierData.iconSet}</Font>

                <View style={styles.prevTierTextContainer}>
                  <Font type='Body7' style={styles.prevTierText}>
                    이전 티어, {prevTierData.name}
                  </Font>
                  <Font type='Body1' style={styles.prevTierTitle}>
                    {prevTierData.title}
                  </Font>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push('/tierOverView')}>
          <Font type='Body7' style={styles.tierPlus}>
            다른 티어 더보기
          </Font>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => router.replace('/')}
        >
          <Font type='MainButton' style={styles.nextBtnText}>
            시작하기
          </Font>
        </TouchableOpacity>
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
    alignSelf: 'center',
  },
  subscribe: {
    marginTop: 12,
    color: NEUTRAL.GRAY_500,
    alignSelf: 'center',
  },
  profileImg: {
    width: 130,
    height: 130,
    borderRadius: 70,
    backgroundColor: NEUTRAL.GRAY_900,
    marginTop: 30,
    alignSelf: 'center',
  },
  subtitle: {
    color: NEUTRAL.GRAY_100,
    marginLeft: 15,
    marginTop: 30,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: NEUTRAL.GRAY_100,
    marginBottom: 10,
  },
  listSection: {
    backgroundColor: NEUTRAL.GRAY_900,
    borderRadius: 30,
    padding: 18,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    color: NEUTRAL.GRAY_300,
    marginRight: 8,
  },
  listText: {
    color: NEUTRAL.GRAY_300,
    flexShrink: 1,
  },
  nextTierSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 50,
    padding: 16,
  },
  nextTier: {
    flexDirection: 'row',
    marginLeft: 15,
    alignItems: 'center',
  },
  nextTierBackground: {
    resizeMode: 'contain',
  },
  nextTierTextContainer: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  NextTierText: {
    color: '#378336',
  },
  NextTierTitle: {
    color: NEUTRAL.BLACK,
    marginTop: 3,
  },
  prevTierSection: {
    flexDirection: 'row',
    overflow: 'hidden',
    paddingLeft: 65,
    marginTop: 20,
    padding: 16,
  },
  prevTier: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prevTierBackground: {
    resizeMode: 'contain',
  },
  prevTierTextContainer: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  prevTierText: {
    color: NEUTRAL.GRAY_600,
  },
  prevTierTitle: {
    color: NEUTRAL.GRAY_500,
    marginTop: 3,
  },
  tierPlus: {
    color: NEUTRAL.GRAY_500,
    alignSelf: 'center',
    borderColor: NEUTRAL.GRAY_500,
    borderBottomWidth: 1,
    paddingBottom: 5,
    marginTop: 20,
    marginBottom: 60,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 40,
    borderTopLeftRadius: 65,
    borderTopRightRadius: 65,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  nextBtn: {
    width: '90%',
    height: 60,
    backgroundColor: NEUTRAL.MAIN,
    borderRadius: 30,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    textAlign: 'center',
    lineHeight: 50,
    color: NEUTRAL.BACKGROUND,
  },
});
