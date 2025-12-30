import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FONT_FAMILY } from '../constants/FontFamily';
import { useAppFonts } from '../hooks/useAppFonts';

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TabItem
          label='분석'
          icon='insert-chart-outlined'
          iconType='MaterialIcons'
          focused={state.index === 0}
          onPress={() => router.push('/')}
        />

        <TabItem
          label='랭킹'
          icon='trophy-outline'
          iconType='Ionicons'
          focused={state.index === 2}
          onPress={() => router.push('/')}
        />
      </View>

      <TouchableOpacity
        style={styles.centerButton}
        onPress={() => router.push('/countDown')}
        activeOpacity={0.9}
      >
        <Ionicons name='walk' size={34} color='#000' />
        <Text style={styles.centerText}>START</Text>
      </TouchableOpacity>
    </View>
  );
}

function TabItem({ label, icon, iconType, focused, onPress }) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      {iconType === 'Ionicons' ? (
        <Ionicons
          name={icon}
          size={24}
          color={focused ? '#EAEAEA' : '#5B5B5B'}
        />
      ) : (
        <MaterialIcons
          name={icon}
          size={24}
          color={focused ? '#EAEAEA' : '#5B5B5B'}
        />
      )}

      <Text
        style={{
          color: focused ? '#EAEAEA' : '#5B5B5B',
          marginTop: 4,
        }}
      >
        {label}
      </Text>
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
    backgroundColor: '#212121',
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
    backgroundColor: '#7BF179',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7BF179',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  centerText: {
    marginTop: 4,
    fontSize: 14,
    color: '#212121',
    fontFamily: FONT_FAMILY.REGULAR,
  },
});
