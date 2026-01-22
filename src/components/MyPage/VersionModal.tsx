import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { Font } from '../Font';

interface VersionModalProps {
  visible: boolean;
  onClose: () => void;
  currentVersion: string;
  latestVersion: string;
}

function VersionModal({
  visible,
  onClose,
  currentVersion,
  latestVersion,
}: VersionModalProps) {
  const isLatestVersion = currentVersion === latestVersion;

  return (
    <Modal visible={visible} transparent animationType='fade'>
      <View style={styles.modalBackground}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <Font type='Head4' style={styles.title}>
            버전 정보
          </Font>

          <View style={styles.versionInfo}>
            <Font type='Body2' style={styles.currentVersion}>
              현재 버전 : {currentVersion}
            </Font>
            <Font
              type='Body2'
              style={[
                styles.latestVersion,
                { color: isLatestVersion ? NEUTRAL.MAIN : NEUTRAL.GRAY_300 },
              ]}
            >
              최신 버전 : {latestVersion}
            </Font>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
            <Font type='SubButton' style={styles.confirmButtonText}>
              확인
            </Font>
          </TouchableOpacity>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    alignSelf: 'stretch',
    marginHorizontal: 20,
    backgroundColor: NEUTRAL.GRAY_900,
    borderRadius: 30,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    color: NEUTRAL.WHITE,
    marginBottom: 30,
  },
  versionInfo: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginBottom: 35,
  },
  currentVersion: {
    color: NEUTRAL.GRAY_300,
  },
  latestVersion: {
    color: NEUTRAL.MAIN,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: NEUTRAL.BLACK,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: NEUTRAL.WHITE,
  },
});

export { VersionModal };
