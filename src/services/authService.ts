import * as AppleAuthentication from 'expo-apple-authentication';
import { BASE_URL } from '../config/api';

export async function appleLogin() {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('NO_IDENTITY_TOKEN');
  }

  const response = await fetch(`${BASE_URL}/auth/oauth/apple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identityToken: credential.identityToken,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message ?? 'AUTH_FAILED');
  }

  return result.data;
}

export async function estimateTier(
  distanceKm: number,
  paceSecPerKm: number,
  accessToken: string,
) {
  const response = await fetch(`${BASE_URL}/onboarding/estimate-tier`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      distanceKm,
      paceSecPerKm,
    }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error?.message ?? 'ESTIMATE_TIER_FAILED');
  }

  return result.data;
}

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error('TOKEN_REFRESH_FAILED');
    }

    return result.data;
  } catch (error) {
    console.error('❌ Token refresh error:', error);

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

export const logout = async (token: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error('로그아웃에 실패했습니다.');
    }
  } catch (error) {
    console.error('❌ Logout error:', error);

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

export const withdraw = async (token: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/withdraw`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error('회원탈퇴에 실패했습니다.');
    }
  } catch (error) {
    console.error('❌ Withdraw error:', error);

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
