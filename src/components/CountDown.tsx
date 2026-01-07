import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Font } from '../components/Font';
import { NEUTRAL } from '../constants/Colors';
import { useAppFonts } from '../hooks/useAppFonts';

function CountDown() {
  const [fontsLoaded] = useAppFonts();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count < 0) return;

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count]);

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
