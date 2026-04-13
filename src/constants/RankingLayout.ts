export const RANKING_LAYOUT = {
  WEEKLY: {
    BORDER_RADIUS: 30,
    PADDING: 20,
    HEADER_MARGIN_BOTTOM: 20,
  },
  PROFILE: {
    FIRST: {
      SIZE: 88,
      PADDING: 15,
      BORDER_RADIUS: 44,
    },
    OTHER: {
      SIZE: 75,
      PADDING: 15,
      BORDER_RADIUS: 37.5,
    },
    BORDER_WIDTH: 2,
  },
  RANK_ICON: {
    SIZE: 24,
    MARGIN_BOTTOM: 10,
  },
  INFO: {
    MARGIN_TOP: 10,
    NICKNAME: {
      MARGIN_BOTTOM: 8,
      MARGIN_TOP: 8,
      MIN_HEIGHT: 16,
      LINE_HEIGHT: 16,
      MARGIN_BOTTOM_MULTILINE: 4,
      MAX_LENGTH: 6,
    },
    PRIMARY_MARGIN_BOTTOM: 2,
  },
  PODIUM: {
    PADDING_TOP: 28,
    PADDING_BOTTOM: 20,
    PADDING_HORIZONTAL: 20,
    BORDER_RADIUS: 20,
  },
  STAGE: {
    HEIGHT: {
      FIRST: 220,
      SECOND: 180,
      THIRD: 140,
    },
    RANK_IMAGE: {
      SIZE: 40,
      TOP_PERCENT: {
        FIRST: '8%',
        SECOND: '10%',
        THIRD: '12%',
      },
    },
    TEXT_TOP_PERCENT: {
      FIRST: '30%',
      SECOND: '38%',
      THIRD: '47%',
    },
  },
  INFO_BANNER: {
    ICON_SIZE: 20,
    MARGIN_TOP: 5,
    TEXT_MARGIN_LEFT: 5,
  },
  LIST: {
    PADDING_BOTTOM: 30,
    ITEM_MARGIN_TOP: 20,
    ITEM_MARGIN_HORIZONTAL: 20,
    ITEM_BORDER_RADIUS: 25,
    ITEM_PADDING_VERTICAL: 15,
    ITEM_PADDING_HORIZONTAL: 20,
  },
  MY_RECORD: {
    MARGIN_TOP: 20,
    MARGIN_HORIZONTAL: 20,
    BORDER_RADIUS: 25,
    PADDING: 15,
    GRADIENT_MARGIN_TOP: 15,
    CONTENT_MARGIN_TOP: 15,
    CONTENT_WIDTH_PERCENT: '90%',
    PROFILE: {
      SIZE: 56,
      BORDER_RADIUS: 28,
      BORDER_WIDTH: 2,
    },
  },
  LIST_ITEM: {
    PROFILE: {
      SIZE: 50,
      BORDER_RADIUS: 25,
      BORDER_WIDTH: 2,
    },
    RANK_MARGIN_RIGHT: 15,
    NICKNAME_MARGIN_LEFT: 20,
    MIN_HEIGHT: 50,
    NICKNAME_LINE_HEIGHT: 20,
    NICKNAME_MAX_LENGTH: 8,
  },
  DETAIL: {
    HEADER: {
      PADDING_TOP: 70,
      PADDING_BOTTOM: 20,
      PADDING_HORIZONTAL: 20,
    },
    BACK_ICON: {
      SIZE: 28,
      LEFT: 12,
      TOP: 70,
    },
  },
} as const;
