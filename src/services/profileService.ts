import { BASE_URL } from '../config/api';
import { assertApiSuccess, throwIfNetworkError } from '../utils/apiUtils';
import type { Gender } from '../utils/commonUtils';

interface ProfileData {
  nickname: string;
  gender: Gender;
  birth: string;
  height: number;
  weight: number;
  profileImage: string | null;
}

interface OnboardingData {
  nickname: string;
  gender: Gender;
  birth: string;
  height: number;
  weight: number;
  displayProfileImage: string;
  customProfileImage: string | null;
}

interface OnboardingResponse {
  success: boolean;
  data: OnboardingData;
}

interface OnboardingUpdateRequest {
  nickname: string;
  birth: string;
  gender: Gender;
  height: number;
  weight: number;
  profileImage: string | null;
}

interface OnboardingUpdateResponse {
  success: boolean;
  data: null;
  error?: {
    code: string;
    message: string;
  };
}

export const getOnboardingData = async (
  token: string,
): Promise<OnboardingData> => {
  try {
    const response = await fetch(`${BASE_URL}/onboarding`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const result: OnboardingResponse = await response.json();
    assertApiSuccess(result, '프로필 정보를 가져오는데 실패했습니다.');
    return result.data;
  } catch (error) {
    throwIfNetworkError(error);
    throw error;
  }
};

export const updateOnboardingData = async (
  token: string,
  onboardingData: OnboardingUpdateRequest,
): Promise<OnboardingUpdateResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(onboardingData),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${result.error?.message || response.statusText}`,
      );
    }
    assertApiSuccess(result, '프로필 수정에 실패했습니다.');
    return result;
  } catch (error) {
    throwIfNetworkError(error);
    throw error;
  }
};

export const submitProfileData = async (
  profileData: ProfileData,
  token: string,
): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${BASE_URL}/onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    const result = await response.json();
    assertApiSuccess(result, 'PROFILE_SAVE_FAILED');
    return result.data;
  } catch (error) {
    throwIfNetworkError(error);
    throw error;
  }
};

export const checkNicknameAvailability = async (
  nickname: string,
  token: string,
): Promise<{ available: boolean }> => {
  try {
    const response = await fetch(
      `${BASE_URL}/onboarding/nickname/check?nickname=${encodeURIComponent(nickname)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const result = await response.json();
    assertApiSuccess(result, 'NICKNAME_CHECK_FAILED');
    return result.data;
  } catch (error) {
    throwIfNetworkError(error);
    throw error;
  }
};
