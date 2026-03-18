import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Font } from '../components/Font';
import { NEUTRAL } from '../constants/Colors';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      setMessage(msg);
      setVisible(true);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setVisible(false));
      }, 3000);
    },
    [opacity, translateY],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {visible && (
        <Animated.View
          style={[styles.toast, { opacity, transform: [{ translateY }] }]}
        >
          <FontAwesome5
            name='check-circle'
            size={20}
            color={NEUTRAL.MAIN}
            solid
          />
          <Font type='Body2' style={styles.toastText}>
            {message}
          </Font>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 150,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: NEUTRAL.BLACK,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: NEUTRAL.MAIN,
    zIndex: 9999,
  },
  toastText: {
    color: NEUTRAL.WHITE,
  },
});
