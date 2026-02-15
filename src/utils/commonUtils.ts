export type Gender = 'M' | 'F' | 'O';
export type GenderUI = 'male' | 'female' | 'other';

export function genderToUI(gender: Gender | null): GenderUI | null {
  switch (gender) {
    case 'M':
      return 'male';
    case 'F':
      return 'female';
    case 'O':
      return 'other';
    default:
      return null;
  }
}

export function genderToAPI(gender: GenderUI | null): Gender | null {
  switch (gender) {
    case 'male':
      return 'M';
    case 'female':
      return 'F';
    case 'other':
      return 'O';
    default:
      return null;
  }
}

// 사용자 표시명
export const getDisplayName = (user: { nickname?: string } | null): string => {
  return user?.nickname || '달려';
};

// 티어 이모지
export const getTierEmoji = (tier: string): string => {
  const tierEmojis: { [key: string]: string } = {
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
  };

  return tierEmojis[tier] || '🦊';
};

// 랜덤 메시지
export const COMMENT_MESSAGES = [
  '랜덤 메시지 리스트 작성 필요',
  '첫 러닝을 기록하고 진짜 티어를 확인해보세요 🔥',
];

export const getRandomMessage = (messages: string[]): string => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

// 그라데이션 세그먼트 생성
export const generateGradientSegments = (totalSegments: number = 50) => {
  const segments = [];

  for (let i = 0; i < totalSegments; i++) {
    const position = i / (totalSegments - 1);
    const intensity = Math.sin(position * Math.PI);
    const opacity = 0.05 + intensity * 0.55;

    segments.push({
      id: i,
      opacity,
    });
  }

  return segments;
};
