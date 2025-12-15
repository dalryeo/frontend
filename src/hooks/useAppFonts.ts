import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFonts } from 'expo-font';

import { FONT_FAMILY } from '../constants/FontFamily';

export const useAppFonts = () => {
  return useFonts({
    [FONT_FAMILY.BOLD]: require('../../assets/fonts/Pretendard-Bold.otf'),
    [FONT_FAMILY.SEMIBOLD]: require('../../assets/fonts/Pretendard-SemiBold.otf'),
    [FONT_FAMILY.MEDIUM]: require('../../assets/fonts/Pretendard-Medium.otf'),
    [FONT_FAMILY.REGULAR]: require('../../assets/fonts/Pretendard-Regular.otf'),
    ...FontAwesome.font,
    ...FontAwesome6.font,
    ...Ionicons.font,
    ...MaterialIcons.font,
  });
};
