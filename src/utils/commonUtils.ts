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
  '오늘도 가볍게 달려볼까요? 🔥',
  '짧아도 괜찮아요. 한 번 뛰어보세요! ⚡️',
  '지금 한 번 달리면 더 가벼워질 거예요 🚀',
  '오늘 컨디션에 맞춰 편하게 달려해보세요 💪🏻',
  '가벼운 러닝도 하루를 바꿔요. 달려볼까요? 🔥',
  '여유 있는 만큼만 달려보세요 🙂',
  '기운이 난다면 가볍게 달려보세요 🏃🏻‍♀️️',
  '조금만 달려도 몸이 가벼워져요 ⚡️🚀',
  '오늘도 내 페이스를 찾아볼 시간이에요 🔥',
  '잠깐이라도 좋아요. 달리면 기분이 달라져요 🌟',
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
