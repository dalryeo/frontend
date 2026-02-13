// 시간 포맷팅 (초 -> MM:SS)
export const formatElapsedTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatTime = ({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}) => {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// 시간 포맷팅 (시:분:초 -> HH:MM:SS)
export const formatTimeFromComponents = (
  hours: number,
  minutes: number,
  seconds: number,
): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 지속시간 포맷팅 (초 -> HH:MM:SS 또는 MM:SS)
export const formatDuration = (durationSec: number): string => {
  const hours = Math.floor(durationSec / 3600);
  const minutes = Math.floor((durationSec % 3600) / 60);
  const seconds = durationSec % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

// 페이스 포맷팅 (초 -> MM'SS")
export const formatPace = (paceSecPerKm: number): string => {
  if (!paceSecPerKm || paceSecPerKm <= 0) return '00\'00"';
  const minutes = Math.floor(paceSecPerKm / 60);
  const seconds = paceSecPerKm % 60;
  return `${String(minutes).padStart(2, '0')}'${String(seconds).padStart(2, '0')}"`;
};

// 닉네임 포맷팅 (긴 닉네임을 여러 줄로)
export const formatNickname = (
  nickname: string,
  maxLength: number = 6,
): string => {
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
};

// 닉네임이 여러 줄인지 체크
export const isMultiLineNickname = (
  nickname: string,
  maxLength: number = 6,
): boolean => {
  const cleanNickname = nickname.replace(/\s/g, '');
  return cleanNickname.length > maxLength;
};

// 거리 포맷팅
export const formatDistance = (distanceKm: number): string => {
  return `${distanceKm.toFixed(2)}km`;
};
