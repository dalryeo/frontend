export function formatNickname(
  nickname: string,
  maxLength: number = 6,
): string {
  const cleanNickname = nickname.replace(/\s/g, '');

  if (cleanNickname.length <= maxLength) {
    return nickname;
  }

  let charCount = 0;
  let splitIndex = 0;

  for (let i = 0; i < nickname.length; i++) {
    if (nickname[i] !== ' ') {
      charCount++;
    }
    if (charCount === maxLength) {
      splitIndex = i + 1;
      break;
    }
  }

  const firstLine = nickname.slice(0, splitIndex).trim();
  const secondLine = nickname.slice(splitIndex).trim();

  return `${firstLine}\n${secondLine}`;
}
