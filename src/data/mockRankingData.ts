import { RankingType } from '../types/ranking.types';

export function getMockRankingData(type: RankingType) {
  if (type === 'tier') {
    return {
      rankings: [
        {
          rank: 2,
          isFirst: false,
          nickname: '발빠른 너구리',
          time: '03\'58"',
          distance: '24.98km',
        },
        {
          rank: 1,
          isFirst: true,
          nickname: '그누구보다도',
          time: '04\'08"',
          distance: '20.21km',
        },
        {
          rank: 3,
          isFirst: false,
          nickname: '아라동 치타',
          time: '04\'12"',
          distance: '12.32km',
        },
      ],
      myRecord: {
        averagePace: `05'32"`,
        rank: '12위',
        percentage: '23.9%',
      },
      rankingList: [
        {
          rank: 4,
          nickname: '달려달려빨리달려보자고요',
          time: '04\'23"',
          distance: '12.08KM',
        },
        {
          rank: 5,
          nickname: '재빠른나',
          time: '04\'23"',
          distance: '9.93KM',
        },
        {
          rank: 6,
          nickname: '달려라하니',
          time: '04\'32"',
          distance: '5.32KM',
        },
        {
          rank: 7,
          nickname: '멈추면죽는남자',
          time: '04\'42"',
          distance: '5.23KM',
        },
        {
          rank: 8,
          nickname: '엽떡러버',
          time: '04\'45"',
          distance: '5.23KM',
        },
      ],
    };
  }

  return {
    rankings: [
      {
        rank: 2,
        isFirst: false,
        nickname: '달려라 하니',
        time: '06\'44"',
        distance: '60.3km',
      },
      {
        rank: 1,
        isFirst: true,
        nickname: '방배동치타',
        time: '06\'03"',
        distance: '74km',
      },
      {
        rank: 3,
        isFirst: false,
        nickname: '미미미니',
        time: '10\'20"',
        distance: '73.2km',
      },
    ],
    myRecord: {
      distance: '24KM',
      rank: '12위',
      percentage: '23.9%',
    },
    rankingList: [
      {
        rank: 4,
        nickname: '겨울엔호빵이지',
        time: '08\'32"',
        distance: '55.3KM',
      },
      {
        rank: 5,
        nickname: '매일달려요',
        time: '10\'30"',
        distance: '50.2KM',
      },
      {
        rank: 6,
        nickname: 'gg',
        time: '06\'32"',
        distance: '48.8KM',
      },
      {
        rank: 7,
        nickname: '랄랄랄랄라',
        time: '07\'02"',
        distance: '44.9KM',
      },
      {
        rank: 8,
        nickname: '달려뿌셔',
        time: '06\'18"',
        distance: '42KM',
      },
    ],
  };
}
