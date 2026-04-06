import { BASE_URL } from '../config/api';
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
  profileImage: string;
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
  profileImage: string;
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

    if (!result.success) {
      throw new Error('프로필 정보를 가져오는데 실패했습니다.');
    }

    return result.data;
  } catch (error) {
    console.error('Get onboarding data error:', error);

    if (
      error instanceof TypeError &&
      error.message.includes('Network request failed')
    ) {
      throw new Error(
        '네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.',
      );
    }

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
      console.error('❌ HTTP 오류:', response.status, response.statusText);
      throw new Error(
        `HTTP ${response.status}: ${result.error?.message || response.statusText}`,
      );
    }

    if (!result.success) {
      throw new Error(result.error?.message ?? '프로필 수정에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('🚨 Update onboarding data error:', error);

    if (
      error instanceof TypeError &&
      error.message.includes('Network request failed')
    ) {
      throw new Error(
        '네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.',
      );
    }

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

    if (!result.success) {
      throw new Error(result.error?.message ?? 'PROFILE_SAVE_FAILED');
    }

    return result.data;
  } catch (error) {
    console.error('Profile submission error:', error);

    if (
      error instanceof TypeError &&
      error.message.includes('Network request failed')
    ) {
      throw new Error(
        '네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.',
      );
    }

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

    if (!result.success) {
      throw new Error(result.error?.message ?? 'NICKNAME_CHECK_FAILED');
    }

    return result.data;
  } catch (error) {
    console.error('닉네임 체크 실패:', error);

    if (
      error instanceof TypeError &&
      error.message.includes('Network request failed')
    ) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }

    throw error;
  }
};
