import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import WheelPicker from '@quidone/react-native-wheel-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
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
import {
  IMAGES,
  profileImageCodeToIndex,
  profileImageIndexToCode,
} from '../../constants/Images';
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
  getOnboardingData,
  updateOnboardingData,
} from '../../services/profileService';

import { genderToAPI } from '@/src/utils/commonUtils';
import { usePickerModal } from '../../hooks/usePickerModal';
import { useProfileForm } from '../../hooks/useProfileForm';
import { ProfileImageModal } from '../common/ProfileImageModal';

type DateTimePickerEvent = {
  type: string;
  nativeEvent: {
    timestamp: number;
    utcOffset: number;
  };
};

function ProfileEdit() {
  const [fontsLoaded] = useAppFonts();
  const [open, setOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalData, setOriginalData] = useState({
    nickname: '',
    gender: '',
    birth: '',
    height: 0,
    weight: 0,
    selectedImg: 0,
  });
  const router = useRouter();
  const { getAccessToken } = useAuth();

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
    showNicknameValidation,
    setGender,
    handleNicknameChange,
    setInitialNickname,
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

  const handleGenderChange = useCallback(
    (newGender: 'male' | 'female' | 'other') => {
      setGender(newGender);
    },
    [setGender],
  );

  const handleImageChange = useCallback(
    (index: number) => {
      setSelectedImg(index);
    },
    [setSelectedImg],
  );

  const isDataChanged = (() => {
    const nicknameChanged = nickname !== originalData.nickname;
    const genderCode: 'M' | 'F' | 'O' =
      gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'O';
    const genderChanged = genderCode !== originalData.gender;
    const birthChanged = formatLocalDate(birthDate) !== originalData.birth;
    const heightChanged = height !== originalData.height;
    const weightChanged = weight !== originalData.weight;
    const imgChanged = selectedImg !== originalData.selectedImg;

    const changed =
      nicknameChanged ||
      genderChanged ||
      birthChanged ||
      heightChanged ||
      weightChanged ||
      imgChanged;

    return changed;
  })();

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadProfileData = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          router.back();
          return;
        }

        const data = await getOnboardingData(token);

        setInitialNickname(data.nickname);
        setGender(
          data.gender === 'M'
            ? 'male'
            : data.gender === 'F'
              ? 'female'
              : 'other',
        );

        const birthDateObj = new Date(data.birth);
        setBirthDate(birthDateObj);
        setBirth(formatDate(birthDateObj));

        setHeight(data.height);
        setWeight(data.weight);
        const imgIndex = profileImageCodeToIndex(data.profileImage);
        setSelectedImg(imgIndex);

        setOriginalData({
          nickname: data.nickname,
          gender: data.gender,
          birth: formatLocalDate(new Date(data.birth)),
          height: data.height,
          weight: data.weight,
          selectedImg: imgIndex,
        });
      } catch (error) {
        console.error('Failed to load profile data:', error);
        Alert.alert('오류', '프로필 정보를 불러오는데 실패했습니다.', [
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadProfileData();
  }, [
    getAccessToken,
    router,
    setBirth,
    setBirthDate,
    setGender,
    setHeight,
    setInitialNickname,
    setSelectedImg,
    setWeight,
  ]);

  const handleUpdateProfile = async () => {
    if (!isFormValid || isDataLoading || !isDataChanged || isUpdating) {
      return;
    }

    try {
      setIsUpdating(true);

      const token = await getAccessToken();
      if (!token) {
        return;
      }

      const updateData = {
        nickname: nickname.trim(),
        birth: formatLocalDate(birthDate),
        gender: genderToAPI(gender)!,
        height: height || 0,
        weight: weight || 0,
        profileImage: profileImageIndexToCode(selectedImg ?? 0),
      };

      const response = await updateOnboardingData(token, updateData);

      if (response.success) {
        Alert.alert('성공', '프로필이 성공적으로 수정되었습니다.', [
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]);

        setOriginalData({
          nickname: nickname.trim(),
          gender: genderToAPI(gender)!,
          birth: formatLocalDate(birthDate),
          height: height || 0,
          weight: weight || 0,
          selectedImg: selectedImg || 0,
        });
      } else {
        Alert.alert(
          '오류',
          response.error?.message || '프로필 수정에 실패했습니다.',
        );
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      Alert.alert('오류', '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsUpdating(false);
    }
  };

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
    const onApply = (value: number) => {
      if (activePicker === 'height') {
        setHeight(value);
      } else if (activePicker === 'weight') {
        setWeight(value);
      }
    };
    closePicker(onApply);
  };

  // 날짜 변경 처리 개선
  const onDateChange = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        // Android에서는 선택 즉시 picker가 닫힘
        closePicker(() => {});
      }

      if (selectedDate) {
        setBirthDate(selectedDate);
        setBirth(formatDate(selectedDate));
      }
    },
    [setBirthDate, setBirth, closePicker],
  );

  // iOS에서 날짜 picker 완료 처리
  const handleDatePickerDone = useCallback(() => {
    closePicker(() => {});
  }, [closePicker]);

  const PROFILE_IMAGES = [
    IMAGES.TIER.CHEETAH,
    IMAGES.TIER.DEER,
    IMAGES.TIER.HUSKY,
    IMAGES.TIER.FOX,
    IMAGES.TIER.RABBIT,
    IMAGES.TIER.PANDA,
    IMAGES.TIER.DUCK,
    IMAGES.TIER.TURTLE,
    IMAGES.TIER.SHEEP,
    IMAGES.TIER.WATERDEER,
  ];

  if (!fontsLoaded || isDataLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size='small' color={NEUTRAL.MAIN} />
      </View>
    );
  }

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
          <View style={styles.profileTitleContainer}>
            <Ionicons
              name='chevron-back'
              size={24}
              style={[styles.back, { color: NEUTRAL.WHITE }]}
              onPress={() => router.back()}
            />
            <Font type='Head5' style={styles.profileTitle}>
              프로필 수정
            </Font>
          </View>

          <View style={{ alignSelf: 'center', marginTop: 30 }}>
            <View style={styles.profileImg}>
              <Image
                source={PROFILE_IMAGES[selectedImg ?? 0]()}
                style={styles.profileImgInner}
                resizeMode='contain'
              />
            </View>
            <MaterialIcons
              name='edit'
              onPress={() => {
                setOpen(true);
              }}
              style={styles.imgIcon}
              size={20}
            />
          </View>

          <ProfileImageModal
            visible={open}
            selectedImg={selectedImg ?? 0}
            onSelect={handleImageChange}
            onClose={() => setOpen(false)}
          />

          <View style={styles.subtitleNick}>
            <Font type='Body4' style={styles.subtitle}>
              닉네임
            </Font>
            <View style={styles.nicknameErrorContainer}>
              {showNicknameValidation && nicknameError && (
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
              {showNicknameValidation && !nicknameError && nickname && (
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
              onPress={() => handleGenderChange('male')}
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
              onPress={() => handleGenderChange('female')}
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
              onPress={() => handleGenderChange('other')}
            >
              <Font
                type='Body4'
                style={[
                  styles.genderText,
                  gender === 'other' && styles.genderSelected,
                ]}
              >
                그 외
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
                <FontAwesome5
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
            (!isFormValid || isDataLoading || !isDataChanged || isUpdating) &&
              styles.nextBtnDisabled,
          ]}
          onPress={handleUpdateProfile}
          disabled={
            !isFormValid || isDataLoading || !isDataChanged || isUpdating
          }
        >
          {isUpdating ? (
            <ActivityIndicator size='small' color={NEUTRAL.WHITE} />
          ) : (
            <Font
              type='MainButton'
              style={[
                styles.nextBtnText,
                (!isFormValid ||
                  isDataLoading ||
                  !isDataChanged ||
                  isUpdating) &&
                  styles.nextBtnTextDisabled,
              ]}
            >
              수정완료
            </Font>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={activePicker !== null} transparent animationType='none'>
        <View style={styles.pickerModalContainer}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={
              activePicker === 'date' && Platform.OS === 'ios'
                ? handleDatePickerDone
                : handleClosePicker
            }
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
                  onPress={
                    activePicker === 'date' && Platform.OS === 'ios'
                      ? handleDatePickerDone
                      : handleClosePicker
                  }
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  profileTitleContainer: {
    alignItems: 'center',
    backgroundColor: NEUTRAL.BLACK,
    paddingBottom: 20,
  },
  back: {
    position: 'absolute',
    top: 75,
    left: 10,
  },
  profileTitle: {
    marginTop: 75,
    color: NEUTRAL.WHITE,
  },
  profileImg: {
    width: 110,
    height: 110,
    borderRadius: 70,
    backgroundColor: NEUTRAL.MAIN,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImgInner: {
    width: 110,
    height: 110,
    padding: 20,
  },
  imgIcon: {
    position: 'absolute',
    bottom: -5,
    right: 5,
    color: NEUTRAL.GRAY_500,
    backgroundColor: NEUTRAL.GRAY_200,
    borderRadius: 20,
    padding: 5,
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
    width: '70%',
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

export { ProfileEdit };
