import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

const PICKER_HEIGHT = 400;

type PickerType = 'height' | 'weight' | 'date' | null;

export const usePickerModal = () => {
  const [activePicker, setActivePicker] = useState<PickerType>(null);
  const [pickerValue, setPickerValue] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

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
  }, [activePicker, slideAnim, backdropAnim]);

  const openPicker = (
    type: 'height' | 'weight' | 'date',
    currentValue?: number,
  ) => {
    if (type !== 'date' && currentValue !== undefined) {
      setPickerValue(currentValue);
    }

    setActivePicker(type);
  };

  const closePicker = (onApply?: (value: number) => void) => {
    if (isClosing) return;
    setIsClosing(true);

    if (
      onApply &&
      pickerValue !== null &&
      (activePicker === 'height' || activePicker === 'weight')
    ) {
      onApply(pickerValue);
    }

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
        setActivePicker(null);
        setIsClosing(false);
      }
    });
  };

  return {
    activePicker,
    pickerValue,
    setPickerValue,
    slideAnim,
    backdropAnim,
    openPicker,
    closePicker,
  };
};
