import React, { FC, PropsWithChildren } from 'react';
import { Text, TextProps } from 'react-native';
import { FONT_FAMILY } from '../constants/FontFamily';
import { useThemeColor } from '../hooks/useThemeColor';

type FontType =
  | 'Head1'
  | 'Head2'
  | 'Head3'
  | 'Head4'
  | 'Head5'
  | 'Body1'
  | 'Body2'
  | 'Body3'
  | 'Body4'
  | 'Body5'
  | 'Body6'
  | 'Caption'
  | 'MainButton'
  | 'SubButton'
  | 'Error'
  | 'CountDown1'
  | 'CountDown2';

interface FontProps extends TextProps {
  type: FontType;
  lightColor?: string;
  darkColor?: string;
}

const createStyle = (
  fontFamily: string,
  fontSize: number,
  lineHeightRatio?: number,
) => ({
  fontFamily,
  fontSize,
  letterSpacing: fontSize * -0.02,
  ...(lineHeightRatio && { lineHeight: fontSize * lineHeightRatio }),
});

const table: Record<FontType, ReturnType<typeof createStyle>> = {
  Head1: createStyle(FONT_FAMILY.BOLD, 34, 1.4),
  Head2: createStyle(FONT_FAMILY.SEMIBOLD, 32, 1.4),
  Head3: createStyle(FONT_FAMILY.SEMIBOLD, 26, 1.4),
  Head4: createStyle(FONT_FAMILY.SEMIBOLD, 22, 1.4),
  Head5: createStyle(FONT_FAMILY.SEMIBOLD, 20, 1.4),
  Body1: createStyle(FONT_FAMILY.BOLD, 18),
  Body2: createStyle(FONT_FAMILY.MEDIUM, 18),
  Body3: createStyle(FONT_FAMILY.REGULAR, 18),
  Body4: createStyle(FONT_FAMILY.REGULAR, 16),
  Body5: createStyle(FONT_FAMILY.SEMIBOLD, 14),
  Body6: createStyle(FONT_FAMILY.REGULAR, 14),
  Caption: createStyle(FONT_FAMILY.REGULAR, 12),
  MainButton: createStyle(FONT_FAMILY.SEMIBOLD, 16),
  SubButton: createStyle(FONT_FAMILY.MEDIUM, 15),
  Error: createStyle(FONT_FAMILY.MEDIUM, 13),
  CountDown1: createStyle(FONT_FAMILY.BOLD, 140),
  CountDown2: createStyle(FONT_FAMILY.BOLD, 120),
};

const Font: FC<PropsWithChildren<FontProps>> = ({
  type,
  style,
  lightColor,
  darkColor,
  children,
  ...rest
}) => {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text style={[table[type], { color }, style]} {...rest}>
      {children}
    </Text>
  );
};

export { Font, FontType };
