export const COMMENT_MESSAGES = [
  '랜덤 메시지 리스트 작성 필요',
  '첫 러닝을 기록하고 진짜 티어를 확인해보세요 🔥',
];

export const getRandomMessage = (messages: string[]): string => {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};
