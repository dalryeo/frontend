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
