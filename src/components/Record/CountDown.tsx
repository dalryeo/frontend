import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

function CountDown() {
  const [fontsLoaded] = useAppFonts();
  const [count, setCount] = useState(3);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  useEffect(() => {
    if (count >= 0) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count, scaleAnim, opacityAnim]);

  useEffect(() => {
    if (count < 0) return;

    if (count > 0) {
      const timer = setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setCount((prev) => prev - 1);
        });
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (count === 0) {
      const navigateTimer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          router.replace('/record');
        });
      }, 1200);

      return () => clearTimeout(navigateTimer);
    }
  }, [count, router, scaleAnim, opacityAnim]);

  if (!fontsLoaded) return null;

  const animatedStyle = {
    transform: [
      {
        scale: scaleAnim.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [0.3, 1.15, 1],
        }),
      },
    ],
    opacity: opacityAnim.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.7, 1],
    }),
  };

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        {count > 0 ? (
          <Font type='CountDown1' style={styles.countText}>
            {count}
          </Font>
        ) : (
          <Font type='CountDown2' style={styles.countText}>
            달려!
          </Font>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: NEUTRAL.MAIN,
    textAlign: 'center',
  },
});

export { CountDown };
