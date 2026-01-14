export const formatTime = (
  hours: number,
  minutes: number,
  seconds: number,
): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const calculatePaceSecPerKm = (
  hours: number,
  minutes: number,
  seconds: number,
  distance: number,
): number => {
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return Math.round(totalSeconds / distance);
};
