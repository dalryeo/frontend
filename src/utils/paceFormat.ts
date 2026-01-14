export const formatPace = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}'${remainingSeconds.toString().padStart(2, '0')}"`;
};

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
