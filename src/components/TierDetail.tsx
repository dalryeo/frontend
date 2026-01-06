import React from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { tiers } from '../data/tiers';

import { Font } from '../components/Font';
import { NEUTRAL } from '../constants/Colors';
import { useAppFonts } from '../hooks/useAppFonts';

interface TierDetailProps {
  tierKey: string;
  visible: boolean;
  onClose: () => void;
}

export default function TierDetail({
  tierKey,
  visible,
  onClose,
}: TierDetailProps) {
  const [fontsLoaded] = useAppFonts();
  if (!visible) return null;

  const tierData = tiers[tierKey as keyof typeof tiers];
  const windowHeight = Dimensions.get('window').height;

  if (!fontsLoaded) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dimArea} activeOpacity={1} />

        <View style={[styles.container, { height: windowHeight * 0.85 }]}>
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            <Font type='Head4' style={styles.title}>
              {tierData.title}
            </Font>
            <Font type='Body4' style={styles.subscribe}>
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
          </ScrollView>

          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Font type='SubButton' style={styles.closeText}>
                확인
              </Font>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  dimArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },

  container: {
    backgroundColor: NEUTRAL.GRAY_900,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },

  title: {
    color: NEUTRAL.WHITE,
    marginTop: 15,
    marginBottom: 15,
    alignSelf: 'center',
  },

  subscribe: {
    color: NEUTRAL.GRAY_500,
    alignSelf: 'center',
    marginBottom: 20,
  },

  profileImg: {
    width: 150,
    height: 150,
    borderRadius: 80,
    backgroundColor: NEUTRAL.GRAY_800,
    marginTop: 10,
    alignSelf: 'center',
  },

  section: {
    marginTop: 20,
  },

  sectionTitle: {
    color: NEUTRAL.WHITE,
    marginBottom: 5,
  },

  listSection: {
    backgroundColor: NEUTRAL.GRAY_900,
    borderRadius: 20,
    padding: 15,
  },

  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },

  bullet: {
    color: NEUTRAL.GRAY_300,
    marginRight: 5,
  },

  listText: {
    color: NEUTRAL.GRAY_300,
    flexShrink: 1,
  },

  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    paddingBottom: 20,
    backgroundColor: NEUTRAL.GRAY_900,
  },

  closeBtn: {
    width: '100%',
    height: 65,
    backgroundColor: NEUTRAL.BLACK,
    borderRadius: 33,
    justifyContent: 'center',
  },

  closeText: {
    textAlign: 'center',
    color: NEUTRAL.WHITE,
  },
});
