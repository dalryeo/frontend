import { useFonts } from "expo-font";

export const FONT_FAMILY = {
  BOLD: "Pretendard-Bold",
  SEMIBOLD: "Pretendard-SemiBold",
  MEDIUM: "Pretendard-Medium",
  REGULAR: "Pretendard-Regular",
};

export const useAppFonts = () => {
  const [loaded] = useFonts({
    [FONT_FAMILY.BOLD]: require("../assets/fonts/Pretendard-Bold.otf"),
    [FONT_FAMILY.SEMIBOLD]: require("../assets/fonts/Pretendard-SemiBold.otf"),
    [FONT_FAMILY.MEDIUM]: require("../assets/fonts/Pretendard-Medium.otf"),
    [FONT_FAMILY.REGULAR]: require("../assets/fonts/Pretendard-Regular.otf"),
  });

  return loaded;
};
