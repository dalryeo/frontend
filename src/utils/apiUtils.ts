export const throwIfNetworkError = (error: unknown): void => {
  if (
    error instanceof TypeError &&
    error.message.includes('Network request failed')
  ) {
    throw new Error('네트워크 연결을 확인해주세요. 서버에 연결할 수 없습니다.');
  }
};

export const assertApiSuccess = (
  result: { success: boolean; error?: { message?: string } },
  fallback: string,
): void => {
  if (!result.success) throw new Error(result.error?.message ?? fallback);
};
