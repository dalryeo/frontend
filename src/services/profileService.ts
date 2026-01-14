import { BASE_URL } from '../config/api';

interface ProfileData {
  nickname: string;
  gender: 'M' | 'F';
  birth: string;
  height: number;
  weight: number;
  profileImage: number | null;
}

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
    console.error('❌ Profile submission error:', error);

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
    console.error('❌ 닉네임 체크 실패:', error);

    if (
      error instanceof TypeError &&
      error.message.includes('Network request failed')
    ) {
      throw new Error('네트워크 연결을 확인해주세요.');
    }

    throw error;
  }
};
