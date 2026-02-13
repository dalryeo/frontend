export const validateNickname = (value: string) => {
  if (/\s/.test(value)) return '공백은 입력할 수 없어요';
  if (value.length < 1) return '최소 1자 이상 입력해야 해요';
  if (value.length > 12) return '최대 12자까지 입력할 수 있어요';
  if (!/^[a-zA-Z0-9가-힣]*$/.test(value))
    return '영문, 숫자, 한글만 입력 가능해요';
  return null;
};
