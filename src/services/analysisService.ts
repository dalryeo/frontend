import { BASE_URL } from '../config/api';
import { assertApiSuccess, throwIfNetworkError } from '../utils/apiUtils';
import { fetchWithTokenRefresh } from './apiClient';

type RefreshTokenCallback = () => Promise<string | null>;

let refreshTokenCallback: RefreshTokenCallback | null = null;

export const setAnalysisRefreshTokenCallback = (
  callback: RefreshTokenCallback,
) => {
  refreshTokenCallback = callback;
};

export interface AnalysisRecord {
  recordId: number;
  distanceKm: number;
  durationSec: number;
  avgPaceSecPerKm: number;
  bpm: number;
  date: string;
}

export interface AnalysisRecordsResponse {
  success: boolean;
  data: {
    total: number;
    records: AnalysisRecord[];
  };
}

export const analysisService = {
  async getAnalysisRecords(
    page: number = 1,
    sort: 'latest' | 'pace' | 'distance' = 'latest',
    token: string,
  ): Promise<AnalysisRecordsResponse> {
    try {
      const response = await fetchWithTokenRefresh(
        `${BASE_URL}/analysis/records?page=${page}&sort=${sort}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
        refreshTokenCallback,
      );

      const result = await response.json();
      assertApiSuccess(result, 'ANALYSIS_RECORDS_FETCH_FAILED');
      return result;
    } catch (error) {
      throwIfNetworkError(error);
      throw error;
    }
  },
};

export const getAnalysisRecords =
  analysisService.getAnalysisRecords.bind(analysisService);
