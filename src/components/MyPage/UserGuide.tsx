import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NEUTRAL } from '../../constants/Colors';
import {
  GuideItem,
  userGuideData,
  UserGuideKey,
} from '../../data/userGuideData';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

const renderTextWithLinks = (text: string, baseStyle: object) => {
  const parts = text.split(URL_REGEX);
  return (
    <Text>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <Font
            key={i}
            type='Body7'
            style={[baseStyle, { textDecorationLine: 'underline' }]}
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Font>
        ) : (
          <Font type='Body7' key={i} style={baseStyle}>
            {part}
          </Font>
        ),
      )}
    </Text>
  );
};

function UserGuide() {
  const [fontsLoaded] = useAppFonts();
  const { guideKey } = useLocalSearchParams<{ guideKey: UserGuideKey }>();

  if (!fontsLoaded) return null;

  const guide = userGuideData[guideKey];
  if (!guide) return null;

  const renderItem = (item: GuideItem, index: number) => {
    switch (item.type) {
      case 'heading':
        return (
          <View key={index} style={styles.headingRow}>
            <Font type='Body6' style={styles.headingText}>
              {item.text}
            </Font>
          </View>
        );

      case 'body':
        return (
          <View key={index} style={styles.bodyRow}>
            <Font type='Body7' style={styles.contentText}>
              {renderTextWithLinks(item.text, styles.contentText)}
            </Font>
          </View>
        );

      case 'bullet': {
        const indentLevel = item.indent ?? 0;
        return (
          <View
            key={index}
            style={[styles.bulletRow, { paddingLeft: 12 + indentLevel * 12 }]}
          >
            <Font type='Body7' style={[styles.contentText, styles.bulletDot]}>
              {'•  '}
            </Font>
            <Font
              type='Body7'
              style={[styles.contentText, styles.bulletContent]}
            >
              {renderTextWithLinks(item.text, styles.contentText)}
            </Font>
          </View>
        );
      }

      case 'numbered': {
        const indentLevel = item.indent ?? 0;
        return (
          <View
            key={index}
            style={[styles.numberedRow, { paddingLeft: indentLevel * 16 }]}
          >
            <Font type='Body7' style={[styles.contentText, styles.numberLabel]}>
              {`${item.number} `}
            </Font>
            <Font
              type='Body7'
              style={[styles.contentText, styles.numberedContent]}
            >
              {item.text}
            </Font>
          </View>
        );
      }

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name='chevron-back'
          size={24}
          style={styles.backIcon}
          onPress={() => router.back()}
        />
        <Font type='Head5' style={styles.headerTitle}>
          {guide.title}
        </Font>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {guide.items.map((item, index) => renderItem(item, index))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const TEXT_STYLE = {
  color: NEUTRAL.WHITE,
  lineHeight: 24,
  letterSpacing: -0.02 * 14,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND ?? NEUTRAL.GRAY_900,
  },
  header: {
    paddingTop: 75,
    paddingBottom: 20,
    backgroundColor: NEUTRAL.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    position: 'absolute',
    top: 75,
    left: 10,
    color: NEUTRAL.WHITE,
  },
  headerTitle: {
    color: NEUTRAL.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headingRow: {
    marginTop: 20,
    marginBottom: 6,
  },
  headingText: {
    ...TEXT_STYLE,
  },
  bodyRow: {
    marginBottom: 4,
  },
  contentText: {
    ...TEXT_STYLE,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bulletDot: {
    ...TEXT_STYLE,
  },
  bulletContent: {
    ...TEXT_STYLE,
    flex: 1,
  },
  numberedRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  numberLabel: {
    ...TEXT_STYLE,
    marginRight: 4,
  },
  numberedContent: {
    ...TEXT_STYLE,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});

export { UserGuide };
