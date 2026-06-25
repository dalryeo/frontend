import {
  Image,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { IMAGES } from '../../constants/Images';
import { LAYOUT } from '../../constants/Layout';
import { Font } from '../Font';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Image source={IMAGES.EMPTY.TURTLE_EMPTY()} style={styles.image} />
      <Font type='Head3' style={styles.title}>
        {title}
      </Font>
      {description && (
        <Font type='Body4' style={styles.description}>
          {description}
        </Font>
      )}
      {action && (
        <TouchableOpacity style={styles.actionButton} onPress={action.onPress}>
          <Font type='MainButton' style={styles.actionButtonText}>
            {action.label}
          </Font>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 180,
    resizeMode: 'contain',
    marginBottom: LAYOUT.EMPTY.MARGIN_BOTTOM_IMAGE,
  },
  title: {
    color: NEUTRAL.WHITE,
    textAlign: 'center',
    marginBottom: LAYOUT.EMPTY.MARGIN_BOTTOM_TITLE,
  },
  description: {
    color: NEUTRAL.GRAY_500,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButton: {
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 100,
    backgroundColor: NEUTRAL.MAIN,
    borderRadius: 50,
  },
  actionButtonText: {
    color: NEUTRAL.BLACK,
  },
});
