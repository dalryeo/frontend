import { FC } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NEUTRAL } from '../../constants/Colors';
import { Font } from '../Font';
import { View } from '../Themed';

const TOP_PADDING = 68;

interface PermissionScreenProps {
  title: string[];
  description: string[];
  buttonText: string;
  onPress: () => void;
}

const PermissionScreen: FC<PermissionScreenProps> = ({
  title,
  description,
  buttonText,
  onPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + TOP_PADDING,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.contentSection}>
        <View style={styles.textCenter}>
          {title.map((text, index) => (
            <Font key={index} type='Head3'>
              {text}
            </Font>
          ))}
        </View>
        <View style={styles.textCenter}>
          {description.map((text, index) => (
            <Font key={index} type='Body4' style={styles.subText}>
              {text}
            </Font>
          ))}
        </View>
      </View>
      <Pressable style={styles.button} onPress={onPress}>
        <Font type='MainButton' style={styles.buttonText}>
          {buttonText}
        </Font>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  contentSection: {
    gap: 8,
  },
  textCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  subText: {
    color: NEUTRAL.GRAY_500,
  },
  button: {
    borderRadius: 50,
    backgroundColor: NEUTRAL.MAIN,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: NEUTRAL.BLACK,
  },
});

export { PermissionScreen };
