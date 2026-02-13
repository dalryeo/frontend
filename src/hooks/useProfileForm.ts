import { useCallback, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkNicknameAvailability } from '../services/profileService';
import { GenderUI } from '../utils/commonUtils';
import { validateNickname } from '../utils/validationUtils';

const DEFAULT_BIRTH_DATE = new Date(2001, 0, 1);

export const useProfileForm = () => {
  const [gender, setGender] = useState<GenderUI | null>(null);
  const [nickname, setNickname] = useState('');
  const [originalNickname, setOriginalNickname] = useState('');
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const [birth, setBirth] = useState('');
  const [birthDate, setBirthDate] = useState<Date>(DEFAULT_BIRTH_DATE);

  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [selectedImg, setSelectedImg] = useState<number | null>(null);

  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [showNicknameValidation, setShowNicknameValidation] = useState(false);

  const timeoutRef = useRef<number | null>(null);
  const { getAccessToken } = useAuth();

  const checkNicknameDuplication = useCallback(
    async (nicknameToCheck: string) => {
      if (!nicknameToCheck.trim()) return;

      if (nicknameToCheck.trim() === originalNickname) {
        setNicknameError(null);
        setNicknameChecked(true);
        setIsCheckingNickname(false);
        setShowNicknameValidation(false);
        return;
      }

      setIsCheckingNickname(true);
      setNicknameChecked(false);
      setShowNicknameValidation(true);

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
        console.error('Nickname validation error:', error);
        setNicknameChecked(false);
      } finally {
        setIsCheckingNickname(false);
      }
    },
    [originalNickname, getAccessToken],
  );

  const handleNicknameChange = useCallback(
    (value: string) => {
      setNickname(value);
      setNicknameChecked(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const basicError = validateNickname(value);
      if (basicError) {
        setNicknameError(basicError);
        setShowNicknameValidation(true);
        return;
      }

      if (value.trim()) {
        setIsCheckingNickname(true);
        setShowNicknameValidation(true);

        timeoutRef.current = setTimeout(() => {
          checkNicknameDuplication(value);
        }, 50);
      } else {
        setNicknameError(null);
        setShowNicknameValidation(false);
      }
    },
    [checkNicknameDuplication],
  );

  const setInitialNickname = (value: string) => {
    setNickname(value);
    setOriginalNickname(value);
    setNicknameError(null);
    setNicknameChecked(true);
    setShowNicknameValidation(false);
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
    showNicknameValidation,
    setInitialNickname,
    setGender,
    handleNicknameChange,
    setBirth,
    setBirthDate,
    setHeight,
    setWeight,
    setSelectedImg,
  };
};
