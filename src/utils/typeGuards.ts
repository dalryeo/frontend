interface ErrorResponse {
  code: string;
  message: string;
}

export const hasErrorCode = (data: unknown): data is ErrorResponse => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    typeof (data as Record<string, unknown>).code === 'string'
  );
};
