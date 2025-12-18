import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { FONT_FAMILY } from '../constants/FontFamily';
import { tiers } from '../data/tiers';

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
  if (!visible) return null;

  const tierData = tiers[tierKey as keyof typeof tiers];
  const windowHeight = Dimensions.get('window').height;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.dimArea}
          activeOpacity={1}
        />

        <View style={[styles.container, { height: windowHeight * 0.85 }]}>
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
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
          </ScrollView>

          {/* 하단 고정 버튼 */}
          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>확인</Text>
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
    backgroundColor: '#212121',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },

  title: {
    color: 'white',
    fontSize: 24,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    marginTop: 15,
    marginBottom: 15,
    alignSelf: 'center',
  },

  subscribe: {
    color: '#979797',
    fontSize: 16,
    alignSelf: 'center',
    marginBottom: 20,
    fontFamily: FONT_FAMILY.REGULAR,
  },

  profileImg: {
    width: 150,
    height: 150,
    borderRadius: 80,
    backgroundColor: '#3C3C3C',
    marginTop: 10,
    alignSelf: 'center',
  },

  section: {
    marginTop: 20,
  },

  sectionTitle: {
    color: 'white',
    fontSize: 20,
    marginBottom: 5,
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },

  listSection: {
    backgroundColor: '#212121',
    borderRadius: 20,
    padding: 15,
  },

  listItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },

  bullet: {
    color: '#DADADA',
    marginRight: 5,
  },

  listText: {
    color: '#DADADA',
    fontSize: 16,
    flexShrink: 1,
  },

  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    paddingBottom: 20,
    backgroundColor: '#212121',
  },

  closeBtn: {
    width: '100%',
    height: 65,
    backgroundColor: '#111111',
    borderRadius: 33,
    justifyContent: 'center',
  },

  closeText: {
    textAlign: 'center',
    fontSize: 15,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    color: '#ffffff',
  },
});
