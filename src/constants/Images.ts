export const IMAGES = {
  RANKING: {
    CROWN: () => require('../../assets/images/Ranking/crown.png'),
    STAGE: {
      FIRST: () => require('../../assets/images/Ranking/firststage.png'),
      SECOND: () => require('../../assets/images/Ranking/secondstage.png'),
      THIRD: () => require('../../assets/images/Ranking/thirdstage.png'),
    },
    MEDAL: {
      FIRST: () => require('../../assets/images/Ranking/first.png'),
      SECOND: () => require('../../assets/images/Ranking/second.png'),
      THIRD: () => require('../../assets/images/Ranking/third.png'),
    },
  },
} as const;
