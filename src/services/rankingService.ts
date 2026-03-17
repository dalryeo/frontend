import { BASE_URL } from '../config/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface RankingApiData {
  rank: number;
  nickname: string;
  weeklyAvgPace: number;
  weeklyDistance: number;
}

interface MyRankingApiData {
  scoreRank?: number;
  distanceRank?: number;
  weeklyAvgPace: number;
  weeklyDistance: number;
}

export async function fetchScoreRanking(): Promise<
  ApiResponse<RankingApiData[]>
> {
  try {
    const response = await fetch(`${BASE_URL}/ranking/weekly/score`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('점수 랭킹 API 호출 실패:', error);
    return { success: false, data: [] };
  }
}

export async function fetchDistanceRanking(): Promise<
  ApiResponse<RankingApiData[]>
> {
  try {
    const response = await fetch(`${BASE_URL}/ranking/weekly/distance`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('거리 랭킹 API 호출 실패:', error);
    return { success: false, data: [] };
  }
}

export async function fetchMyRanking(
  accessToken: string,
): Promise<ApiResponse<MyRankingApiData>> {
  const defaultMyRankingData: MyRankingApiData = {
    weeklyAvgPace: 0,
    weeklyDistance: 0,
  };

  try {
    const response = await fetch(`${BASE_URL}/ranking/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.data && data.data.code) {
      console.error('API 에러:', data.data.message);
      return {
        success: false,
        data: defaultMyRankingData,
        error: data.data.message,
      };
    }

    return data;
  } catch (error) {
    console.error('내 랭킹 API 호출 실패:', error);
    return {
      success: false,
      data: defaultMyRankingData,
    };
  }
}

export const fetchScoreRankingDetail = fetchScoreRanking;
export const fetchDistanceRankingDetail = fetchDistanceRanking;
