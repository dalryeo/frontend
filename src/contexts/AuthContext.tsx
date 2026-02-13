import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { BASE_URL } from '../config/api';
import { setAnalysisRefreshTokenCallback } from '../services/analysisService';
import { setRefreshTokenCallback } from '../services/recordService';
import { setWeeklyRefreshTokenCallback } from '../services/weeklyService';

export interface User {
  id: string;
  nickname?: string;
  email?: string;
}

export interface TierData {
  tierCode: string;
  displayName: string;
  tierGrade: string;
  score: number;
}

export interface OnboardingData {
  nickname: string;
  gender: string;
  birth: string;
  height: number;
  weight: number;
  profileImage?: string;
}

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => Promise<void>;
  isLoading: boolean;
  login: (
    user: User,
    accessToken: string,
    refreshToken: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  tierData: TierData | null;
  setTierData: (tierData: TierData | null) => void;
  getAccessToken: () => Promise<string | null>;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (completed: boolean) => void;
  onboardingData: OnboardingData | null;
  checkOnboardingStatus: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  forceLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tierData, setTierData] = useState<TierData | null>(null);
  const [isOnboardingComplete, setIsOnboardingCompleteState] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const forceLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        'user',
        'accessToken',
        'refreshToken',
        'onboardingComplete',
        'onboardingData',
      ]);
      setUserState(null);
      setOnboardingData(null);
      setIsOnboardingCompleteState(false);

      setTimeout(() => {
        router.replace('/login');
      }, 100);
    } catch (error) {
      console.error('Force logout failed:', error);
    }
  }, [router]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshing) {
      let attempts = 0;
      while (isRefreshing && attempts < 10) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }
      return await AsyncStorage.getItem('accessToken');
    }

    setIsRefreshing(true);

    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (!refreshToken) {
        await forceLogout();
        return null;
      }

      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();

      if (result.success && result.data && !result.data.code) {
        const { accessToken, refreshToken: newRefreshToken } = result.data;

        const updates: [string, string][] = [['accessToken', accessToken]];
        if (newRefreshToken) {
          updates.push(['refreshToken', newRefreshToken]);
        }

        await AsyncStorage.multiSet(updates);
        return accessToken;
      } else {
        await forceLogout();
        return null;
      }
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      await forceLogout();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, forceLogout]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      let accessToken = await AsyncStorage.getItem('accessToken');

      if (!accessToken) {
        console.log('AccessToken이 없음');
        return null;
      }

      try {
        const testResponse = await fetch(`${BASE_URL}/auth/verify`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (testResponse.status === 401) {
          return await refreshAccessToken();
        }

        return accessToken;
      } catch (verifyError) {
        console.log('토큰 검증 스킵 (네트워크 오류):', verifyError);
        return accessToken;
      }
    } catch (error) {
      console.error('AccessToken 확인 오류:', error);
      return await refreshAccessToken();
    }
  }, [refreshAccessToken]);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return false;

      const response = await fetch(`${BASE_URL}/onboarding`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data && result.data.code === 'AC-006') {
          console.log('refreshToken 만료 - 자동 로그아웃 처리');
          await forceLogout();
          return false;
        }

        if (result.success && result.data) {
          const hasNickname =
            result.data.nickname && result.data.nickname.trim() !== '';

          setOnboardingData(result.data);
          setIsOnboardingCompleteState(hasNickname);

          if (hasNickname) {
            try {
              const storedUser = await AsyncStorage.getItem('user');
              if (storedUser) {
                const currentUser = JSON.parse(storedUser);
                const updatedUser = {
                  ...currentUser,
                  nickname: result.data.nickname,
                  email: result.data.email || currentUser.email,
                };

                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                setUserState(updatedUser);
              }
            } catch (userUpdateError) {
              console.error('사용자 정보 업데이트 실패:', userUpdateError);
            }

            await AsyncStorage.setItem('onboardingComplete', 'true');
            await AsyncStorage.setItem(
              'onboardingData',
              JSON.stringify(result.data),
            );
          } else {
            await AsyncStorage.removeItem('onboardingComplete');
            await AsyncStorage.removeItem('onboardingData');
          }

          return hasNickname;
        } else {
          setIsOnboardingCompleteState(false);
          setOnboardingData(null);
          await AsyncStorage.removeItem('onboardingComplete');
          await AsyncStorage.removeItem('onboardingData');
          return false;
        }
      } else {
        setIsOnboardingCompleteState(false);
        setOnboardingData(null);
        return false;
      }
    } catch (error) {
      console.error('온보딩 상태 확인 오류:', error);
      setIsOnboardingCompleteState(false);
      setOnboardingData(null);
      return false;
    }
  }, [getAccessToken, forceLogout]);

  const login = useCallback(
    async (user: User, accessToken: string, refreshToken: string) => {
      try {
        await AsyncStorage.multiSet([
          ['user', JSON.stringify(user)],
          ['accessToken', accessToken],
          ['refreshToken', refreshToken],
        ]);
        setUserState(user);

        const isComplete = await checkOnboardingStatus();
        return isComplete;
      } catch (error) {
        console.error('Login save failed:', error);
        throw error;
      }
    },
    [checkOnboardingStatus],
  );

  const checkAuthStatus = useCallback(async () => {
    try {
      const [
        storedUser,
        accessToken,
        storedTierData,
        onboardingStatus,
        storedOnboardingData,
      ] = await AsyncStorage.multiGet([
        'user',
        'accessToken',
        'tierData',
        'onboardingComplete',
        'onboardingData',
      ]);

      if (storedUser[1] && accessToken[1]) {
        const parsedUser = JSON.parse(storedUser[1]);
        setUserState(parsedUser);

        await checkOnboardingStatus();
      }

      if (storedTierData[1]) {
        setTierData(JSON.parse(storedTierData[1]));
      }

      if (onboardingStatus[1] === 'true') {
        setIsOnboardingCompleteState(true);
      }

      if (storedOnboardingData[1]) {
        setOnboardingData(JSON.parse(storedOnboardingData[1]));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [checkOnboardingStatus]);

  const setUser = useCallback(async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem('user');
      }
      setUserState(userData);
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error);
      setUserState(userData);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        'user',
        'accessToken',
        'refreshToken',
        'tierData',
        'onboardingComplete',
        'onboardingData',
      ]);
      setUserState(null);
      setTierData(null);
      setIsOnboardingCompleteState(false);
      setOnboardingData(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const saveTierData = useCallback(async (tierData: TierData | null) => {
    try {
      if (tierData) {
        await AsyncStorage.setItem('tierData', JSON.stringify(tierData));
      } else {
        await AsyncStorage.removeItem('tierData');
      }
      setTierData(tierData);
    } catch (error) {
      console.error('Save tier data failed:', error);
    }
  }, []);

  const setOnboardingComplete = useCallback(
    async (completed: boolean) => {
      try {
        if (completed) {
          await AsyncStorage.setItem('onboardingComplete', 'true');
          await checkOnboardingStatus();
        } else {
          await AsyncStorage.removeItem('onboardingComplete');
          await AsyncStorage.removeItem('onboardingData');
          setOnboardingData(null);
        }
        setIsOnboardingCompleteState(completed);
      } catch (error) {
        console.error('Save onboarding status failed:', error);
      }
    },
    [checkOnboardingStatus],
  );

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    setRefreshTokenCallback(refreshAccessToken);
    setAnalysisRefreshTokenCallback(refreshAccessToken);
    setWeeklyRefreshTokenCallback(refreshAccessToken);
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        login,
        logout,
        tierData,
        setTierData: saveTierData,
        getAccessToken,
        isOnboardingComplete,
        setOnboardingComplete,
        onboardingData,
        checkOnboardingStatus,
        refreshAccessToken,
        forceLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
