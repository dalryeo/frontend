export const IMAGES = {
  APP: {
    ICON: () => require('../../assets/images/App/Dalryeo_AppIcon.png'),
    MAINZ: () => require('../../assets/images/App/mainZ.png'),
    LOGIN: () => require('../../assets/images/App/Dalryeo_Login.png'),
    SPLASH: () => require('../../assets/images/App/Dalryeo_Splash.png'),
  },

  EMPTY: {
    TURTLE_EMPTY: () => require('../../assets/images/Empty/turtle_empty.png'),
  },

  MAIN: {
    ACCOUNT_ICON: () => require('../../assets/images/Main/accountIcon.png'),
    HOME: () => require('../../assets/images/Main/home.png'),
  },

  RANKING: {
    CROWN: () => require('../../assets/images/Ranking/crown.png'),
    STAGE: {
      FIRST: () => require('../../assets/images/Ranking/Stage/firststage.png'),
      SECOND: () =>
        require('../../assets/images/Ranking/Stage/secondstage.png'),
      THIRD: () => require('../../assets/images/Ranking/Stage/thirdstage.png'),
    },
    MEDAL: {
      FIRST: () => require('../../assets/images/Ranking/Medal/first.png'),
      SECOND: () => require('../../assets/images/Ranking/Medal/second.png'),
      THIRD: () => require('../../assets/images/Ranking/Medal/third.png'),
    },
    GOLD: {
      CHEETAH: () =>
        require('../../assets/images/Ranking/Gold/cheetah_Gold.png'),
      DEER: () => require('../../assets/images/Ranking/Gold/deer_Gold.png'),
      DUCK: () => require('../../assets/images/Ranking/Gold/duck_Gold.png'),
      FOX: () => require('../../assets/images/Ranking/Gold/fox_Gold.png'),
      HUSKY: () => require('../../assets/images/Ranking/Gold/husky_Gold.png'),
      PANDA: () => require('../../assets/images/Ranking/Gold/panda_Gold.png'),
      RABBIT: () => require('../../assets/images/Ranking/Gold/rabbit_Gold.png'),
      SHEEP: () => require('../../assets/images/Ranking/Gold/sheep_Gold.png'),
      TURTLE: () => require('../../assets/images/Ranking/Gold/turtle_Gold.png'),
      WATERDEER: () =>
        require('../../assets/images/Ranking/Gold/waterdeer_Gold.png'),
    },
    SILVER: {
      CHEETAH: () =>
        require('../../assets/images/Ranking/Silver/cheetah_Silver.png'),
      DEER: () => require('../../assets/images/Ranking/Silver/deer_Silver.png'),
      DUCK: () => require('../../assets/images/Ranking/Silver/duck_Silver.png'),
      FOX: () => require('../../assets/images/Ranking/Silver/fox_Silver.png'),
      HUSKY: () =>
        require('../../assets/images/Ranking/Silver/husky_Silver.png'),
      PANDA: () =>
        require('../../assets/images/Ranking/Silver/panda_Silver.png'),
      RABBIT: () =>
        require('../../assets/images/Ranking/Silver/rabbit_Silver.png'),
      SHEEP: () =>
        require('../../assets/images/Ranking/Silver/sheep_Silver.png'),
      TURTLE: () =>
        require('../../assets/images/Ranking/Silver/turtle_Silver.png'),
      WATERDEER: () =>
        require('../../assets/images/Ranking/Gold/waterdeer_Gold.png'),
    },
    BRONZE: {
      CHEETAH: () =>
        require('../../assets/images/Ranking/Bronze/cheetah_Bronze.png'),
      DEER: () => require('../../assets/images/Ranking/Bronze/deer_Bronze.png'),
      DUCK: () => require('../../assets/images/Ranking/Bronze/duck_Bronze.png'),
      FOX: () => require('../../assets/images/Ranking/Bronze/fox_Bronze.png'),
      HUSKY: () =>
        require('../../assets/images/Ranking/Bronze/husky_Bronze.png'),
      PANDA: () =>
        require('../../assets/images/Ranking/Bronze/panda_Bronze.png'),
      RABBIT: () =>
        require('../../assets/images/Ranking/Bronze/rabbit_Bronze.png'),
      SHEEP: () =>
        require('../../assets/images/Ranking/Bronze/sheep_Bronze.png'),
      TURTLE: () =>
        require('../../assets/images/Ranking/Bronze/turtle_Bronze.png'),
      WATERDEER: () =>
        require('../../assets/images/Ranking/Gold/waterdeer_Gold.png'),
    },
  },

  TIER: {
    NEON: {
      NEON_CHEETAH: () =>
        require('../../assets/images/Tier/Neon/cheetah_neon.png'),
      NEON_DEER: () => require('../../assets/images/Tier/Neon/deer_neon.png'),
      NEON_DUCK: () => require('../../assets/images/Tier/Neon/duck_neon.png'),
      NEON_FOX: () => require('../../assets/images/Tier/Neon/fox_neon.png'),
      NEON_HUSKY: () => require('../../assets/images/Tier/Neon/husky_neon.png'),
      NEON_PANDA: () => require('../../assets/images/Tier/Neon/panda_neon.png'),
      NEON_RABBIT: () =>
        require('../../assets/images/Tier/Neon/rabbit_neon.png'),
      NEON_SHEEP: () => require('../../assets/images/Tier/Neon/sheep_neon.png'),
      NEON_TURTLE: () =>
        require('../../assets/images/Tier/Neon/turtle_neon.png'),
      NEON_WATERDEER: () =>
        require('../../assets/images/Tier/Neon/waterdeer_neon.png'),
    },
    CHEETAH: () => require('../../assets/images/Tier/cheetah.png'),
    DEER: () => require('../../assets/images/Tier/deer.png'),
    DUCK: () => require('../../assets/images/Tier/duck.png'),
    FOX: () => require('../../assets/images/Tier/fox.png'),
    HUSKY: () => require('../../assets/images/Tier/husky.png'),
    PANDA: () => require('../../assets/images/Tier/panda.png'),
    RABBIT: () => require('../../assets/images/Tier/rabbit.png'),
    SHEEP: () => require('../../assets/images/Tier/sheep.png'),
    TURTLE: () => require('../../assets/images/Tier/turtle.png'),
    WATERDEER: () => require('../../assets/images/Tier/waterdeer.png'),
  },

  TIER_DETAIL: {
    TIER_INFO: () => require('../../assets/images/TierDetail/TierInfo.png'),
    NEXT_TIER: () => require('../../assets/images/TierDetail/nextTier.png'),
    PREV_TIER: () => require('../../assets/images/TierDetail/prevTier.png'),
  },
} as const;

export const PROFILE_IMAGE_CODES = [
  'CHEETAH',
  'DEER',
  'HUSKY',
  'FOX',
  'RABBIT',
  'PANDA',
  'DUCK',
  'TURTLE',
  'SHEEP',
  'WATERDEER',
] as const;

export const profileImageIndexToCode = (index: number): string =>
  PROFILE_IMAGE_CODES[index] ?? 'TURTLE';

export const profileImageCodeToIndex = (code: string | null): number => {
  if (!code) return 0;
  const idx = PROFILE_IMAGE_CODES.indexOf(
    code as (typeof PROFILE_IMAGE_CODES)[number],
  );
  return idx >= 0 ? idx : 0;
};

export const getRankingTierImage = (rank: number, tierCode: string) => {
  const gradeMap: Record<number, Record<string, () => number>> = {
    1: IMAGES.RANKING.GOLD,
    2: IMAGES.RANKING.SILVER,
    3: IMAGES.RANKING.BRONZE,
  };

  const grade = gradeMap[rank];
  if (!grade) return null;

  const key = tierCode?.toUpperCase() as keyof typeof grade;
  return (grade[key] ?? grade.TURTLE)();
};

export const getTierImage = (tierCode: string) => {
  const map: Record<string, () => number> = {
    CHEETAH: IMAGES.TIER.NEON.NEON_CHEETAH,
    DEER: IMAGES.TIER.NEON.NEON_DEER,
    DUCK: IMAGES.TIER.NEON.NEON_DUCK,
    FOX: IMAGES.TIER.NEON.NEON_FOX,
    HUSKY: IMAGES.TIER.NEON.NEON_HUSKY,
    PANDA: IMAGES.TIER.NEON.NEON_PANDA,
    RABBIT: IMAGES.TIER.NEON.NEON_RABBIT,
    SHEEP: IMAGES.TIER.NEON.NEON_SHEEP,
    TURTLE: IMAGES.TIER.NEON.NEON_TURTLE,
    WATERDEER: IMAGES.TIER.NEON.NEON_WATERDEER,
    // 한글 tierCode도 혹시 오는 경우 대비
    치타: IMAGES.TIER.NEON.NEON_CHEETAH,
    사슴: IMAGES.TIER.NEON.NEON_DEER,
    오리: IMAGES.TIER.NEON.NEON_DUCK,
    여우: IMAGES.TIER.NEON.NEON_FOX,
    허스키: IMAGES.TIER.NEON.NEON_HUSKY,
    판다: IMAGES.TIER.NEON.NEON_PANDA,
    토끼: IMAGES.TIER.NEON.NEON_RABBIT,
    양: IMAGES.TIER.NEON.NEON_SHEEP,
    거북이: IMAGES.TIER.NEON.NEON_TURTLE,
    고라니: IMAGES.TIER.NEON.NEON_WATERDEER,
  };

  return (map[tierCode] ?? IMAGES.TIER.TURTLE)();
};

export const getTierBaseImage = (tierCode: string) => {
  const map: Record<string, () => number> = {
    CHEETAH: IMAGES.TIER.CHEETAH,
    DEER: IMAGES.TIER.DEER,
    DUCK: IMAGES.TIER.DUCK,
    FOX: IMAGES.TIER.FOX,
    HUSKY: IMAGES.TIER.HUSKY,
    PANDA: IMAGES.TIER.PANDA,
    RABBIT: IMAGES.TIER.RABBIT,
    SHEEP: IMAGES.TIER.SHEEP,
    TURTLE: IMAGES.TIER.TURTLE,
    WATERDEER: IMAGES.TIER.WATERDEER,

    // 한글 대응
    치타: IMAGES.TIER.CHEETAH,
    사슴: IMAGES.TIER.DEER,
    오리: IMAGES.TIER.DUCK,
    여우: IMAGES.TIER.FOX,
    허스키: IMAGES.TIER.HUSKY,
    판다: IMAGES.TIER.PANDA,
    토끼: IMAGES.TIER.RABBIT,
    양: IMAGES.TIER.SHEEP,
    거북이: IMAGES.TIER.TURTLE,
    고라니: IMAGES.TIER.WATERDEER,
  };

  return (map[tierCode] ?? IMAGES.TIER.TURTLE)();
};
