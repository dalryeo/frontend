import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppFonts } from '../hooks/useAppFonts';
import { Font } from './Font';

import type { ComponentProps } from 'react';
import { NEUTRAL } from '../constants/Colors';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type MaterialCommunityIconName = ComponentProps<
  typeof MaterialCommunityIcons
>['name'];

type TabItemProps =
  | {
      label: string;
      iconType: 'Ionicons';
      icon: IoniconName;
      focused: boolean;
      onPress: () => void;
    }
  | {
      label: string;
      iconType: 'MaterialCommunityIcons';
      icon: MaterialCommunityIconName;
      focused: boolean;
      onPress: () => void;
    };

export default function CustomTabBar({ state }: BottomTabBarProps) {
  const [fontsLoaded] = useAppFonts();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isTransitioning, setIsTransitioning] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(1);
      setIsTransitioning(false);
    }, [fadeAnim]),
  );

  if (!fontsLoaded) return null;

  const currentRouteName = state.routes[state.index]?.name;

  const handleStartPress = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {
      router.push('/countDown');
    });
  };

  return (
    <>
      <Animated.View
        style={[
          styles.dissolveOverlay,
          {
            opacity: Animated.subtract(1, fadeAnim),
            pointerEvents: isTransitioning ? 'auto' : 'none',
          },
        ]}
      />

      <View style={styles.wrapper}>
        <View style={styles.container}>
          <TabItem
            label='기록'
            iconType='MaterialCommunityIcons'
            icon='clipboard-text-outline'
            focused={currentRouteName === 'analysis/index'}
            onPress={() => router.push('/(tabs)/analysis')}
          />

          <TabItem
            label='랭킹'
            iconType='Ionicons'
            icon='trophy-outline'
            focused={currentRouteName === 'ranking/index'}
            onPress={() => router.push('/(tabs)/ranking')}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.centerButton,
            isTransitioning && styles.centerButtonPressed,
          ]}
          onPress={handleStartPress}
          activeOpacity={0.9}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          disabled={isTransitioning}
        >
          <FontAwesome5
            style={{ color: NEUTRAL.GRAY_900 }}
            name='running'
            size={32}
          />
          <Font type='Caption' style={styles.centerText}>
            START
          </Font>
        </TouchableOpacity>
      </View>
    </>
  );
}

function TabItem(props: TabItemProps) {
  const { label, focused, onPress } = props;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      {props.iconType === 'Ionicons' ? (
        <Ionicons
          name={props.icon}
          size={24}
          color={focused ? NEUTRAL.GRAY_200 : NEUTRAL.GRAY_700}
        />
      ) : props.iconType === 'MaterialCommunityIcons' ? (
        <MaterialCommunityIcons
          name={props.icon}
          size={24}
          color={focused ? NEUTRAL.GRAY_200 : NEUTRAL.GRAY_700}
        />
      ) : null}

      <Font
        type='Caption'
        style={{
          color: focused ? NEUTRAL.GRAY_200 : NEUTRAL.GRAY_700,
          marginTop: 4,
        }}
      >
        {label}
      </Font>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    width: '90%',
    height: 70,
    backgroundColor: NEUTRAL.GRAY_900,
    borderRadius: 30,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  tabItem: {
    alignItems: 'center',
  },
  centerButton: {
    position: 'absolute',
    bottom: 25,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: NEUTRAL.MAIN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NEUTRAL.MAIN,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  centerButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  centerText: {
    marginTop: 4,
    color: NEUTRAL.GRAY_900,
  },
  dissolveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 9999,
  },
});
