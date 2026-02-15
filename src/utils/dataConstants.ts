// 기본값 설정
export const defaultValues = {
  male: { height: 175, weight: 70 },
  female: { height: 160, weight: 55 },
  other: { height: 170, weight: 65 },
  default: { height: 170, weight: 65 },
};

// 선택 데이터 생성
export const heightData = Array.from({ length: 121 }, (_, i) => ({
  value: 130 + i,
  label: `${130 + i}cm`,
}));

export const weightData = Array.from({ length: 121 }, (_, i) => ({
  value: 30 + i,
  label: `${30 + i}kg`,
}));

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

// 기본값 반환 함수
export const getDefaultValue = (
  gender: 'male' | 'female' | 'other' | null,
  type: 'height' | 'weight',
): number => {
  if (!gender) {
    return defaultValues.default[type];
  }

  const genderDefaults = defaultValues[gender];
  return genderDefaults ? genderDefaults[type] : defaultValues.default[type];
};
