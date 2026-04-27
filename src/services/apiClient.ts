type RefreshTokenCallback = () => Promise<string | null>;

export async function fetchWithTokenRefresh(
  url: string,
  options: RequestInit,
  refreshTokenCallback: RefreshTokenCallback | null,
  retryCount = 0,
  throwOnTokenExpired = true,
): Promise<Response> {
  const response = await fetch(url, options);
  const result = await response.json();

  if (
    result.data?.code === 'AC-006' ||
    result.data?.message?.includes('refreshToken 만료') ||
    result.data?.message?.includes('토큰') ||
    result.message?.includes('토큰') ||
    response.status === 401
  ) {
    if (retryCount < 1 && refreshTokenCallback) {
      const newToken = await refreshTokenCallback();

      if (newToken) {
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        return fetchWithTokenRefresh(
          url,
          newOptions,
          refreshTokenCallback,
          retryCount + 1,
          throwOnTokenExpired,
        );
      }
    }

    if (throwOnTokenExpired) {
      throw new Error('TOKEN_EXPIRED');
    }
  }

  return new Response(JSON.stringify(result), {
    status: response.status,
    headers: response.headers,
  });
}
