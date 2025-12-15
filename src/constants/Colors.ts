/**
 * 컬러 시스템 구성 환경 파일
 *
 * 달려앱은 다크,라이트 모두 동일한 컬러로 진행
 * 확장을 고려하여 라이트, 다크 모두 동일한 컬러 명시
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
