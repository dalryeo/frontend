import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FONT_FAMILY } from '../constants/FontFamily';
import { tiers } from '../data/tiers';
import { useAppFonts } from '../hooks/useAppFonts';

export default function TierRecommend() {
  const fontsLoaded = useAppFonts();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [tierKey, setTierKey] = useState<keyof typeof tiers>('gorani');

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
        <Text style={styles.title}>{tierData.title}</Text>
        <Text style={styles.subscribe}>{tierData.subtitle}</Text>

        <View style={styles.profileImg} />

        {tierData.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {section.icon} {section.title}
            </Text>

            <View style={styles.listSection}>
              {section.items.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{item}</Text>
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
              source={require('../../assets/images/Tier/nextTier.png')}
              style={styles.nextTierSection}
              imageStyle={styles.nextTierBackground}
            >
              <View style={styles.nextTier}>
                <Text style={styles.TierImg}>{nextTierData.iconSet}</Text>

                <View style={styles.nextTierTextContainer}>
                  <Text style={styles.NextTierText}>
                    다음 티어, {nextTierData.name}
                  </Text>
                  <Text style={styles.NextTierTitle}>{nextTierData.title}</Text>
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
              source={require('../../assets/images/Tier/prevTier.png')}
              style={styles.prevTierSection}
              imageStyle={styles.prevTierBackground}
            >
              <View style={styles.prevTier}>
                <Text style={styles.TierImg}>{prevTierData.iconSet}</Text>

                <View style={styles.prevTierTextContainer}>
                  <Text style={styles.prevTierText}>
                    이전 티어, {prevTierData.name}
                  </Text>
                  <Text style={styles.prevTierTitle}>{prevTierData.title}</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.push('/tierOverView')}>
          <Text style={styles.tierPlus}>다른 티어 더보기</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>시작하기</Text>
        </TouchableOpacity>
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
    alignSelf: 'center',
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  subscribe: {
    marginTop: 12,
    fontSize: 16,
    color: '#979797',
    alignSelf: 'center',
    fontFamily: FONT_FAMILY.REGULAR,
  },
  profileImg: {
    width: 130,
    height: 130,
    borderRadius: 70,
    backgroundColor: '#212121',
    marginTop: 30,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#F3F3F3',
    marginLeft: 15,
    marginTop: 30,
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#F3F3F3',
    fontFamily: FONT_FAMILY.SEMIBOLD,
    marginBottom: 10,
  },
  listSection: {
    backgroundColor: '#212121',
    borderRadius: 30,
    padding: 18,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bullet: {
    color: '#DADADA',
    fontSize: 16,
    marginRight: 8,
  },
  listText: {
    color: '#DADADA',
    fontSize: 15,
    fontFamily: FONT_FAMILY.REGULAR,
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
  TierImg: {
    fontSize: 40,
  },
  nextTierTextContainer: {
    marginLeft: 15,
    justifyContent: 'center',
  },
  NextTierText: {
    color: '#378336',
    fontSize: 14,
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  NextTierTitle: {
    color: '#111111',
    fontSize: 18,
    marginTop: 3,
    fontFamily: FONT_FAMILY.BOLD,
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
    color: '#6E6E6E',
    fontSize: 14,
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  prevTierTitle: {
    color: '#979797',
    fontSize: 18,
    marginTop: 3,
    fontFamily: FONT_FAMILY.BOLD,
  },
  tierPlus: {
    color: '#979797',
    fontSize: 14,
    alignSelf: 'center',
    borderColor: '#979797',
    borderBottomWidth: 1,
    paddingBottom: 5,
    marginTop: 20,
    marginBottom: 60,
    fontFamily: FONT_FAMILY.MEDIUM,
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
    backgroundColor: '#151515',
  },
  nextBtn: {
    width: '90%',
    height: 60,
    backgroundColor: '#7BF179',
    borderRadius: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  nextBtnText: {
    textAlign: 'center',
    lineHeight: 50,
    fontSize: 15,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    color: '#151515',
  },
});
