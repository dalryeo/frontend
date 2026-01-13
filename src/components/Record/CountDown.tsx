import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

function CountDown() {
  const [fontsLoaded] = useAppFonts();
  const [count, setCount] = useState(3);
  const router = useRouter();

  useEffect(() => {
    if (count < 0) return;

    if (count > 0) {
      const timer = setTimeout(() => {
        setCount((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }

    if (count === 0) {
      const navigateTimer = setTimeout(() => {
        router.replace('/record');
      }, 1000);

      return () => clearTimeout(navigateTimer);
    }
  }, [count, router]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {count > 0 ? (
        <Font type='CountDown1' style={styles.countText}>
          {count}
        </Font>
      ) : (
        <Font type='CountDown2' style={styles.countText}>
          달려!
        </Font>
      )}
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
  },
});

export { CountDown };
