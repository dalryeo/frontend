import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkNicknameAvailability } from '../services/profileService';
import { validateNickname } from '../utils/validation';

export type GenderType = 'male' | 'female' | null;

export const useProfileForm = () => {
  const [gender, setGender] = useState<GenderType>(null);
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [birth, setBirth] = useState('');
  const [birthDate, setBirthDate] = useState<Date>(new Date(2000, 0, 1));
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [selectedImg, setSelectedImg] = useState<number | null>(null);

  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);

  const { getAccessToken } = useAuth();

  let timeoutId: NodeJS.Timeout | undefined;

  const checkNicknameDuplication = async (nicknameToCheck: string) => {
    if (!nicknameToCheck.trim()) return;

    setIsCheckingNickname(true);
    setNicknameChecked(false);

    try {
      const token = await getAccessToken();
      if (!token) {
        setNicknameError('인증 토큰이 없습니다');
        return;
      }

      const result = await checkNicknameAvailability(
        nicknameToCheck.trim(),
        token,
      );

      if (result.available) {
        setNicknameError(null);
        setNicknameChecked(true);
      } else {
        setNicknameError('이미 사용 중인 닉네임이에요');
        setNicknameChecked(false);
      }
    } catch (error) {
      console.error('닉네임 중복 체크 오류:', error);
      setNicknameError('닉네임 확인 중 오류가 발생했어요');
      setNicknameChecked(false);
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameChecked(false);

    if (timeoutId) clearTimeout(timeoutId);

    const basicError = validateNickname(value);
    if (basicError) {
      setNicknameError(basicError);
      setIsCheckingNickname(false);
      return;
    }

    if (value.trim()) {
      setIsCheckingNickname(true);

      timeoutId = setTimeout(() => {
        checkNicknameDuplication(value);
      }, 800) as unknown as NodeJS.Timeout;
    } else {
      setNicknameError(null);
      setIsCheckingNickname(false);
    }
  };

  const isFormValid =
    nickname.trim() &&
    !nicknameError &&
    nicknameChecked &&
    !isCheckingNickname &&
    gender &&
    birth &&
    height &&
    weight;

  return {
    gender,
    nickname,
    nicknameError,
    birth,
    birthDate,
    height,
    weight,
    selectedImg,
    isFormValid,
    isCheckingNickname,
    nicknameChecked,
    setGender,
    handleNicknameChange,
    setBirth,
    setBirthDate,
    setHeight,
    setWeight,
    setSelectedImg,
  };
};
