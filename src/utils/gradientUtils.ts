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
