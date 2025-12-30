import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONT_FAMILY } from '../constants/FontFamily';
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

  const displayText = count > 0 ? count : '달려!';

  return (
    <View style={styles.container}>
      <Text style={styles.countText}>{displayText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 120,
    color: '#7BF179',
    fontFamily: FONT_FAMILY.BOLD,
  },
});

export { CountDown };
