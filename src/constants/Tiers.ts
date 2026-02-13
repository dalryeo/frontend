export interface TierInfo {
  name: string;
  minDistance: number;
  maxDistance: number;
  color: string;
}

export const TIER_ICONS: Record<string, string> = {
  CHEETAH: '🐆',
  DEER: '🦌',
  HUSKY: '🐕',
  FOX: '🦊',
  GORANI: '🦌',
  SHEEP: '🐑',
  RABBIT: '🐇',
  PANDA: '🐼',
  DUCK: '🦆',
  TURTLE: '🐢',
} as const;

export const DEFAULT_TIER_ICON = '🐕';

export function getTierIcon(tierCode?: TierCode): string {
  if (!tierCode) return DEFAULT_TIER_ICON;
  return TIER_ICONS[tierCode] ?? DEFAULT_TIER_ICON;
}

export const TIER_NAMES: Record<string, string> = {
  CHEETAH: '치타',
  DEER: '사슴',
  HUSKY: '허스키',
  FOX: '여우',
  GORANI: '고라니',
  SHEEP: '양',
  RABBIT: '토끼',
  PANDA: '판다',
  DUCK: '오리',
  TURTLE: '거북이',
} as const;

export function getTierName(tierCode?: TierCode): string {
  if (!tierCode) return '티어 없음';
  return TIER_NAMES[tierCode] ?? '알 수 없음';
}

export const TIER_ORDER = [
  'CHEETAH',
  'DEER',
  'HUSKY',
  'FOX',
  'GORANI',
  'SHEEP',
  'RABBIT',
  'PANDA',
  'DUCK',
  'TURTLE',
] as const;

// TierCode 타입 정의
export type TierCode = (typeof TIER_ORDER)[number];
