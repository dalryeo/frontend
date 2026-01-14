export const DEFAULT_VALUES = {
  male: { height: 175, weight: 70 },
  female: { height: 160, weight: 55 },
  default: { height: 170, weight: 65 },
};

export const heightData = Array.from({ length: 121 }, (_, i) => ({
  value: 100 + i,
  label: `${100 + i} cm`,
}));

export const weightData = Array.from({ length: 121 }, (_, i) => ({
  value: 30 + i,
  label: `${30 + i} kg`,
}));

export const getDefaultValue = (
  gender: 'male' | 'female' | null,
  type: 'height' | 'weight',
) => {
  const values = gender ? DEFAULT_VALUES[gender] : DEFAULT_VALUES.default;
  return values[type];
};
