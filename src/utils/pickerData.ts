export const distanceData = Array.from({ length: 500 }, (_, i) => ({
  value: (i + 1) / 10,
  label: `${((i + 1) / 10).toFixed(1)} km`,
}));

export const minuteData = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, '0'),
}));

export const secondData = Array.from({ length: 60 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, '0'),
}));

export const hourData = Array.from({ length: 13 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, '0'),
}));
