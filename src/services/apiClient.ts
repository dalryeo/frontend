type RefreshTokenCallback = () => Promise<string | null>;

const TIMEOUT_MS = 60000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Network request timed out');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchWithTokenRefresh(
  url: string,
  options: RequestInit,
  refreshTokenCallback: RefreshTokenCallback | null,
  retryCount = 0,
  throwOnTokenExpired = true,
): Promise<Response> {
  const response = await fetchWithTimeout(url, options);
  const result = await response.json();

  if (
    result.data?.code === 'AC-006' ||
    result.data?.message?.includes('refreshToken 만료') ||
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
