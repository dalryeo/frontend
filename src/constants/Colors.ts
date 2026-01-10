/**
 * 컬러 시스템 구성 환경 파일
 *
 * 달려앱은 다크,라이트 모두 동일한 컬러로 진행
 * 확장을 고려하여 라이트, 다크 모두 동일한 컬러 명시
 */

export const NEUTRAL = {
  MAIN: '#7BF179',
  BACKGROUND: '#151515',
  WHITE: '#ffffff',
  GRAY_100: '#f3f3f3',
  GRAY_200: '#EAEAEA',
  GRAY_300: '#DADADA',
  GRAY_400: '#B7B7B7',
  GRAY_500: '#979797',
  GRAY_600: '#6E6E6E',
  GRAY_700: '#5B5B5B',
  GRAY_800: '#3C3C3C',
  GRAY_900: '#212121',
  BLACK: '#111111',
  DANGER: '#FF3B30',
  DARKGREEN: '#378336',
} as const;

const tintColorDark = NEUTRAL.WHITE;
// const tintColorLight = '#2f95dc';

export default {
  // 다크/라이트 동일한 색상으로 진행확정
  light: {
    text: NEUTRAL.WHITE,
    background: NEUTRAL.BACKGROUND,
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
  dark: {
    text: NEUTRAL.WHITE,
    background: NEUTRAL.BACKGROUND,
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
