import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

const PICKER_HEIGHT = 400;

export const usePickerAnimation = (activePicker: string | null) => {
  const slideAnim = useRef(new Animated.Value(PICKER_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activePicker) {
      slideAnim.setValue(PICKER_HEIGHT);
      backdropAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activePicker, backdropAnim, slideAnim]);

  const closePicker = (callback?: () => void) => {
    return new Promise<void>((resolve) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: PICKER_HEIGHT,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          callback?.();
          resolve();
        }
      });
    });
  };

  return {
    slideAnim,
    backdropAnim,
    closePicker,
  };
};
