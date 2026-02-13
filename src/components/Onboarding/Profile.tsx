import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import WheelPicker from '@quidone/react-native-wheel-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { NEUTRAL } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAppFonts } from '../../hooks/useAppFonts';
import { Font } from '../Font';

import {
  getDefaultValue,
  heightData,
  weightData,
} from '../../utils/dataConstants';
import { formatDate, formatLocalDate } from '../../utils/dateUtils';

import {
  checkNicknameAvailability,
  submitProfileData,
} from '../../services/profileService';

import { usePickerModal } from '../../hooks/usePickerModal';
import { useProfileForm } from '../../hooks/useProfileForm';

type DateTimePickerEvent = {
  type: string;
  nativeEvent: {
    timestamp: number;
    utcOffset: number;
  };
};

function Profile() {
  const [fontsLoaded] = useAppFonts();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { getAccessToken, tierData, user, setUser } = useAuth();

  const {
    gender,
    nickname,
    nicknameError,
    birth,
    birthDate,
    height,
    weight,
    selectedImg,
    isFormValid,
    nicknameChecked,
    setGender,
    handleNicknameChange,
    setBirth,
    setBirthDate,
    setHeight,
    setWeight,
    setSelectedImg,
  } = useProfileForm();

  const {
    activePicker,
    pickerValue,
    setPickerValue,
    slideAnim,
    backdropAnim,
    openPicker,
    closePicker,
  } = usePickerModal();

  const handleOpenPicker = (type: 'height' | 'weight' | 'date') => {
    if (type === 'date') {
      openPicker('date');
      return;
    }

    const defaultVal = getDefaultValue(gender, type);
    const currentValue =
      type === 'height' ? (height ?? defaultVal) : (weight ?? defaultVal);

    openPicker(type, currentValue);
  };

  const handleClosePicker = () => {
    if (activePicker === 'date') {
      if (!birth) {
        const defaultDate = new Date(2001, 0, 1);
        setBirthDate(defaultDate);
        setBirth(formatDate(defaultDate));
      }
      closePicker();
      return;
    }

    const onApply = (value: number) => {
      if (activePicker === 'height') {
        setHeight(value);
      } else if (activePicker === 'weight') {
        setWeight(value);
      }
    };

    closePicker(onApply);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setBirthDate(selectedDate);
      setBirth(formatDate(selectedDate));
    }
  };

  const handleSubmit = async () => {
    // 닉네임 중복 체크가 완료되지 않았으면 먼저 체크
    if (!nicknameChecked && nickname.trim()) {
      try {
        const token = await getAccessToken();
        if (!token) {
          Alert.alert('오류', '인증 토큰이 없습니다. 다시 로그인해주세요.');
          return;
        }

        const result = await checkNicknameAvailability(nickname.trim(), token);
        if (!result.available) {
          Alert.alert(
            '닉네임 중복',
            '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.',
          );
          return;
        }
      } catch (error) {
        console.error('닉네임 확인 오류:', error);
        Alert.alert('오류', '닉네임 확인 중 오류가 발생했습니다.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const token = await getAccessToken();

      if (!token) {
        Alert.alert('오류', '인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }

      await submitProfileData(
        {
          nickname: nickname.trim(),
          gender: gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'O',
          birth: formatLocalDate(birthDate),
          height: height!,
          weight: weight!,
          profileImage: selectedImg,
        },
        token,
      );

      if (user) {
        const updatedUser = {
          ...user,
          nickname: nickname.trim(),
        };
        await setUser(updatedUser);
      }

      if (tierData) {
        router.replace('/tierRecommend');
      } else {
        router.replace('/healthPermission');
      }
    } catch (error) {
      console.error('Profile submission error:', error);

      let errorMessage = '프로필 저장 중 오류가 발생했습니다.';

      if (error instanceof Error) {
        if (error.message === 'PROFILE_SAVE_FAILED') {
          errorMessage = '프로필 저장에 실패했습니다. 다시 시도해주세요.';
        } else if (error.message.includes('네트워크')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          <Ionicons
            name='chevron-back'
            size={24}
            style={[styles.back, { color: NEUTRAL.WHITE }]}
            onPress={() => router.back()}
          />

          <Font type='Head2' style={styles.title}>
            프로필을 완성해주세요
          </Font>

          <Font type='Body3' style={styles.subscribe}>
            입력하신 닉네임과 프로필은 랭킹 화면에 표시돼요
          </Font>

          <View style={[styles.profileImg, { marginTop: 50 }]}></View>
          <MaterialIcons
            name='edit'
            onPress={() => setOpen(true)}
            style={[styles.imgIcon, { color: NEUTRAL.GRAY_500 }]}
            size={20}
          />

          <Modal visible={open} transparent animationType='slide'>
            <View style={styles.sheetBackground}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => setOpen(false)}
              />

              <View style={styles.sheet}>
                <Font type='Head4' style={styles.profileText}>
                  프로필 이미지를 선택해주세요
                </Font>

                <View style={styles.sheetInner}>
                  {[...Array(6)].map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImg(index)}
                      style={[
                        styles.profileImgModal,
                        selectedImg === index && {
                          borderWidth: 2,
                          borderColor: NEUTRAL.MAIN,
                        },
                      ]}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => setOpen(false)}
                  style={styles.applyBtn}
                >
                  <Font type='SubButton' style={styles.applyBtnText}>
                    적용하기
                  </Font>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.subtitleNick}>
            <Font type='Body4' style={styles.subtitle}>
              닉네임
            </Font>
            <View style={styles.nicknameErrorContainer}>
              {nickname && nicknameError && (
                <>
                  <MaterialIcons
                    name='error-outline'
                    size={16}
                    style={{ color: NEUTRAL.DANGER }}
                  />
                  <Font type='Error' style={styles.nicknameError}>
                    {nicknameError}
                  </Font>
                </>
              )}
              {nickname && !nicknameError && (
                <>
                  <Ionicons
                    name='checkmark-circle-outline'
                    size={16}
                    style={{ color: NEUTRAL.MAIN }}
                  />
                  <Font type='Error' style={styles.nicknameSuccess}>
                    사용 가능한 닉네임이에요
                  </Font>
                </>
              )}
            </View>
          </View>

          <TextInput
            style={styles.nickname}
            placeholder='1~12자, 영문·한글·숫자만 입력할 수 있어요.'
            placeholderTextColor={NEUTRAL.GRAY_700}
            value={nickname}
            onChangeText={handleNicknameChange}
            returnKeyType='done'
          />

          <Font type='Body4' style={[styles.subtitle, { marginTop: 30 }]}>
            성별
          </Font>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderSelected,
              ]}
              onPress={() => setGender('male')}
            >
              <Font
                type='Body4'
                style={[
                  styles.genderText,
                  gender === 'male' && styles.genderSelected,
                ]}
              >
                남자
              </Font>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderSelected,
              ]}
              onPress={() => setGender('female')}
            >
              <Font
                type='Body4'
                style={[
                  styles.genderText,
                  gender === 'female' && styles.genderSelected,
                ]}
              >
                여자
              </Font>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'other' && styles.genderSelected,
              ]}
              onPress={() => setGender('other')}
            >
              <Font
                type='Body4'
                style={[
                  styles.genderText,
                  gender === 'other' && styles.genderSelected,
                ]}
              >
                그외
              </Font>
            </TouchableOpacity>
          </View>

          <View style={styles.stats}>
            <View style={styles.birthBox}>
              <Font type='Body4' style={styles.subtext}>
                생년월일
              </Font>
              <Pressable
                style={styles.statureContainer}
                onPress={() => handleOpenPicker('date')}
              >
                <Font
                  type='Body4'
                  style={[styles.statureText, !birth && styles.placeholder]}
                >
                  {birth || '00/00/00'}
                </Font>
                <FontAwesome6
                  style={[styles.unit, { color: NEUTRAL.GRAY_500 }]}
                  name='calendar'
                  size={16}
                />
              </Pressable>
            </View>

            <View style={styles.halfBox}>
              <Font type='Body4' style={styles.subtext}>
                키
              </Font>
              <Pressable
                style={styles.statureContainer}
                onPress={() => handleOpenPicker('height')}
              >
                <Font
                  type='Body4'
                  style={[styles.statureText, !height && styles.placeholder]}
                >
                  {height ?? '-'}
                </Font>
                <Font type='Body4' style={styles.unit}>
                  cm
                </Font>
              </Pressable>
            </View>

            <View style={styles.halfBox}>
              <Font type='Body4' style={styles.subtext}>
                몸무게
              </Font>
              <Pressable
                style={styles.statureContainer}
                onPress={() => handleOpenPicker('weight')}
              >
                <Font
                  type='Body4'
                  style={[styles.statureText, !weight && styles.placeholder]}
                >
                  {weight ?? '-'}
                </Font>
                <Font type='Body4' style={styles.unit}>
                  kg
                </Font>
              </Pressable>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </TouchableWithoutFeedback>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            (!isFormValid || isLoading) && styles.nextBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isLoading}
        >
          <Font
            type='MainButton'
            style={[
              styles.nextBtnText,
              (!isFormValid || isLoading) && styles.nextBtnTextDisabled,
            ]}
          >
            {isLoading ? '저장 중...' : '다음으로'}
          </Font>
        </TouchableOpacity>
      </View>

      <Modal visible={activePicker !== null} transparent animationType='none'>
        <View style={styles.pickerModalContainer}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleClosePicker}
          >
            <Animated.View
              style={[styles.pickerBackdrop, { opacity: backdropAnim }]}
            />
          </Pressable>

          <Animated.View
            style={[
              styles.pickerSheet,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.pickerSheetContent}>
              <View style={styles.pickerHeader}>
                <Font type='Body4' style={styles.pickerTitle}>
                  {activePicker === 'height'
                    ? '키'
                    : activePicker === 'weight'
                      ? '몸무게'
                      : '생년월일'}
                </Font>
                <Pressable
                  onPress={handleClosePicker}
                  hitSlop={10}
                  style={styles.pickerDoneBtn}
                >
                  <Font type='Body4' style={styles.pickerDone}>
                    완료
                  </Font>
                </Pressable>
              </View>
              <View style={styles.wheelPickerWrapper}>
                {activePicker === 'date' ? (
                  <View style={styles.datePickerContainer}>
                    <DateTimePicker
                      testID='dateTimePicker'
                      value={birthDate}
                      mode='date'
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      maximumDate={new Date()}
                      minimumDate={new Date(1950, 0, 1)}
                      textColor={NEUTRAL.WHITE}
                      themeVariant='dark'
                      style={styles.dateTimePicker}
                    />
                  </View>
                ) : (
                  activePicker && (
                    <WheelPicker
                      data={activePicker === 'height' ? heightData : weightData}
                      value={pickerValue ?? 0}
                      onValueChanged={({ item: { value } }) => {
                        setPickerValue(value);
                      }}
                      itemTextStyle={styles.pickerItemText}
                    />
                  )
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: NEUTRAL.BACKGROUND,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  bottomSpacer: {
    height: 20,
  },
  title: {
    color: NEUTRAL.WHITE,
    marginTop: 120,
    marginLeft: 20,
    lineHeight: 35,
  },
  subscribe: {
    marginTop: 12,
    color: NEUTRAL.GRAY_500,
    marginLeft: 20,
  },
  subtitle: {
    color: NEUTRAL.GRAY_500,
    marginLeft: 20,
  },
  stats: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    marginTop: 30,
    alignSelf: 'center',
    gap: 10,
  },
  subtext: {
    color: NEUTRAL.GRAY_500,
  },
  back: {
    position: 'absolute',
    top: 75,
    left: 10,
  },
  profileImg: {
    width: 110,
    height: 110,
    borderRadius: 70,
    backgroundColor: NEUTRAL.GRAY_900,
    marginTop: 20,
    alignSelf: 'center',
  },
  sheetBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: NEUTRAL.GRAY_900,
    paddingBottom: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sheetInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: NEUTRAL.GRAY_900,
  },
  profileImgModal: {
    width: 110,
    height: 110,
    borderRadius: 70,
    backgroundColor: NEUTRAL.GRAY_800,
    marginTop: 20,
    alignSelf: 'center',
  },
  applyBtn: {
    width: '100%',
    backgroundColor: NEUTRAL.BLACK,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginTop: 25,
  },
  applyBtnText: {
    color: NEUTRAL.WHITE,
    textAlign: 'center',
  },
  profileText: {
    color: NEUTRAL.WHITE,
  },
  imgIcon: {
    position: 'absolute',
    top: 325,
    left: '54%',
    backgroundColor: NEUTRAL.GRAY_200,
    borderRadius: 20,
    padding: 5,
  },
  nickname: {
    height: 50,
    backgroundColor: NEUTRAL.GRAY_900,
    borderColor: NEUTRAL.GRAY_800,
    borderWidth: 1,
    borderRadius: 32,
    marginTop: 10,
    alignSelf: 'center',
    width: '90%',
    paddingHorizontal: 23,
    color: NEUTRAL.WHITE,
  },
  genderContainer: {
    flexDirection: 'row',
    width: '75%', // 3개 버튼을 위해 너비 증가
    marginLeft: 20,
    marginTop: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 17,
    borderWidth: 1,
    borderColor: NEUTRAL.GRAY_800,
    borderRadius: 13,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  genderSelected: {
    borderColor: NEUTRAL.MAIN,
    color: NEUTRAL.MAIN,
  },
  genderText: {
    color: NEUTRAL.GRAY_500,
  },
  birthBox: {
    width: '36%',
  },
  halfBox: {
    width: '27%',
  },
  statureInput: {
    flex: 1,
    color: NEUTRAL.WHITE,
  },
  statureText: {
    flex: 1,
    color: NEUTRAL.WHITE,
  },
  placeholder: {
    color: NEUTRAL.GRAY_700,
  },
  statureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: NEUTRAL.GRAY_900,
    borderRadius: 32,
    height: 50,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  unit: {
    color: NEUTRAL.GRAY_700,
  },
  nextBtn: {
    width: '100%',
    height: 60,
    backgroundColor: NEUTRAL.MAIN,
    borderRadius: 30,
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: NEUTRAL.GRAY_800,
  },
  nextBtnText: {
    textAlign: 'center',
    lineHeight: 50,
    color: NEUTRAL.BACKGROUND,
  },
  nextBtnTextDisabled: {
    color: NEUTRAL.GRAY_600,
  },
  nicknameErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    gap: 4,
  },
  subtitleNick: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 35,
  },
  nicknameError: {
    color: NEUTRAL.DANGER,
  },
  nicknameSuccess: {
    color: NEUTRAL.MAIN,
  },
  pickerModalContainer: {
    flex: 1,
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  pickerSheetContent: {
    backgroundColor: NEUTRAL.GRAY_900,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.GRAY_800,
  },
  pickerTitle: {
    color: NEUTRAL.WHITE,
  },
  pickerDoneBtn: {
    position: 'absolute',
    right: 16,
  },
  pickerDone: {
    color: NEUTRAL.MAIN,
  },
  wheelPickerWrapper: {
    overflow: 'hidden',
    paddingVertical: 20,
  },
  pickerItemText: {
    color: NEUTRAL.WHITE,
  },
  datePickerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTimePicker: {
    width: '100%',
    backgroundColor: NEUTRAL.GRAY_900,
  },
});

export { Profile };
