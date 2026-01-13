import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppFonts } from '../hooks/useAppFonts';
import { Font } from './Font';

import type { ComponentProps } from 'react';
import { NEUTRAL } from '../constants/Colors';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

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
      iconType: 'MaterialIcons';
      icon: MaterialIconName;
      focused: boolean;
      onPress: () => void;
    };

export default function CustomTabBar({ state }: BottomTabBarProps) {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) return null;

  const currentRouteName = state.routes[state.index]?.name;

  console.log('Current route name:', currentRouteName);
  console.log('Current index:', state.index);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TabItem
          label='분석'
          iconType='MaterialIcons'
          icon='insert-chart-outlined'
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
        style={styles.centerButton}
        onPress={() => router.push('/countDown')}
        activeOpacity={0.9}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Ionicons style={{ color: NEUTRAL.GRAY_900 }} name='walk' size={34} />
        <Font type='Caption' style={styles.centerText}>
          START
        </Font>
      </TouchableOpacity>
    </View>
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
      ) : (
        <MaterialIcons
          name={props.icon}
          size={24}
          color={focused ? NEUTRAL.GRAY_200 : NEUTRAL.GRAY_700}
        />
      )}

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
  centerText: {
    marginTop: 4,
    color: NEUTRAL.GRAY_900,
  },
});
