import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { Font } from '../Font';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  cancelText?: string;
  confirmText: string;
  singleButton?: boolean;
}

function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  cancelText,
  confirmText,
  singleButton = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType='fade'>
      <View style={styles.modalBackground}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <Font type='Head4' style={styles.title}>
            {title}
          </Font>

          {description && (
            <View style={styles.descriptionContainer}>
              <Font type='Body4' style={styles.description}>
                {description}
              </Font>
            </View>
          )}

          {!singleButton && cancelText && (
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Font type='MainButton' style={styles.cancelButtonText}>
                {cancelText}
              </Font>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              singleButton ? styles.singleConfirmButton : styles.confirmButton,
            ]}
            onPress={handleConfirm}
          >
            <Font
              type='MainButton'
              style={[
                singleButton
                  ? styles.singleConfirmButtonText
                  : styles.confirmButtonText,
              ]}
            >
              {confirmText}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  description: {
    color: NEUTRAL.GRAY_500,
    textAlign: 'center',
    lineHeight: 24,
  },
  cancelButton: {
    width: '100%',
    backgroundColor: NEUTRAL.MAIN,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: {
    color: NEUTRAL.BLACK,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: NEUTRAL.GRAY_800,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: NEUTRAL.GRAY_600,
  },
  singleConfirmButton: {
    width: '100%',
    backgroundColor: NEUTRAL.BLACK,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },
  singleConfirmButtonText: {
    color: NEUTRAL.WHITE,
  },
});

export { ConfirmModal };
