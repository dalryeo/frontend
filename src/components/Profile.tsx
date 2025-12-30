import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import WheelPicker from '@quidone/react-native-wheel-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FONT_FAMILY } from '../constants/FontFamily';
import { useAppFonts } from '../hooks/useAppFonts';

const PICKER_HEIGHT = 400;

const DEFAULT_VALUES = {
  male: { height: 175, weight: 70 },
  female: { height: 160, weight: 55 },
  default: { height: 170, weight: 65 },
};

const heightData = Array.from({ length: 121 }, (_, i) => ({
  value: 100 + i,
  label: `${100 + i} cm`,
}));

const weightData = Array.from({ length: 121 }, (_, i) => ({
  value: 30 + i,
  label: `${30 + i} kg`,
}));

function Profile() {
  const [fontsLoaded] = useAppFonts();
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [birth, setBirth] = useState('');
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [selectedImg, setSelectedImg] = useState<number | null>(null);
  const [activePicker, setActivePicker] = useState<'height' | 'weight' | null>(
    null,
  );
  const [pickerValue, setPickerValue] = useState<number>(170);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  const slideAnim = useRef(new Animated.Value(PICKER_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const getDefaultValue = (type: 'height' | 'weight') => {
    const values = gender ? DEFAULT_VALUES[gender] : DEFAULT_VALUES.default;
    return values[type];
  };

  const openPicker = (type: 'height' | 'weight') => {
    const defaultVal = getDefaultValue(type);
    const currentValue =
      type === 'height' ? (height ?? defaultVal) : (weight ?? defaultVal);

    setPickerValue(currentValue);
    setActivePicker(type);
  };

  useEffect(() => {
    if (activePicker) {
      slideAnim.setValue(PICKER_HEIGHT);
      backdropAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activePicker, backdropAnim, slideAnim]);

  const closePicker = () => {
    if (isClosing) return;
    setIsClosing(true);

    if (activePicker === 'height') {
      setHeight(pickerValue);
    } else if (activePicker === 'weight') {
      setWeight(pickerValue);
    }

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: PICKER_HEIGHT,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setActivePicker(null);
        setIsClosing(false);
      }
    });
  };

  if (!fontsLoaded) return null;

  const validateNickname = (value: string) => {
    setNickname(value);

    if (/\s/.test(value)) return setNicknameError('공백은 입력할 수 없어요');
    if (value.length < 1)
      return setNicknameError('최소 1자 이상 입력해야 해요');
    if (value.length > 12)
      return setNicknameError('최대 12자까지 입력할 수 있어요');
    if (!/^[a-zA-Z0-9가-힣]*$/.test(value))
      return setNicknameError('영문, 숫자, 한글만 입력 가능해요');

    setNicknameError(null);
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name='chevron-back'
        size={24}
        color='white'
        style={styles.back}
        onPress={() => router.back()}
      />

      <Text style={styles.title}>프로필을 완성해주세요</Text>

      <Text style={styles.subscribe}>
        입력하신 닉네임과 프로필은 랭킹 화면에 표시돼요
      </Text>

      <View style={[styles.profileImg, { marginTop: 50 }]}></View>
      <MaterialIcons
        name='edit'
        onPress={() => setOpen(true)}
        style={styles.imgIcon}
        size={20}
        color='#979797'
      />

      <Modal visible={open} transparent animationType='slide'>
        <View style={styles.sheetBackground}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setOpen(false)}
          />

          <View style={styles.sheet}>
            <View style={styles.sheetInner}>
              <Text style={styles.profileText}>
                프로필 이미지를 선택해주세요
              </Text>

              {[...Array(6)].map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImg(index)}
                  style={[
                    styles.profileImg,
                    selectedImg === index && {
                      borderWidth: 2,
                      borderColor: '#7BF179',
                    },
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setOpen(false)}
              style={styles.applyBtn}
            >
              <Text style={styles.applyBtnText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.subtitleNick}>
        <Text style={styles.subtitle}>닉네임</Text>
        <View style={styles.nicknameErrorContainer}>
          <View style={styles.nicknameErrorContainer}>
            {nickname ? (
              nicknameError ? (
                <>
                  <MaterialIcons
                    name='error-outline'
                    size={16}
                    color='#FF3B30'
                  />
                  <Text style={styles.nicknameError}>{nicknameError}</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name='checkmark-circle-outline'
                    size={16}
                    color='#7BF179'
                  />
                  <Text style={styles.nicknameSuccess}>
                    사용 가능한 닉네임이에요
                  </Text>
                </>
              )
            ) : null}
          </View>
        </View>
      </View>

      <TextInput
        style={styles.nickname}
        placeholder='1~12자, 영문·한글·숫자만 입력할 수 있어요.'
        placeholderTextColor='#5B5B5B'
        value={nickname}
        onChangeText={validateNickname}
      />

      <Text style={[styles.subtitle, { marginTop: 30 }]}>성별</Text>
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === 'male' && styles.genderSelected,
          ]}
          onPress={() => setGender('male')}
        >
          <Text
            style={[
              styles.genderText,
              gender === 'male' && styles.genderSelected,
            ]}
          >
            남자
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderButton,
            gender === 'female' && styles.genderSelected,
          ]}
          onPress={() => setGender('female')}
        >
          <Text
            style={[
              styles.genderText,
              gender === 'female' && styles.genderSelected,
            ]}
          >
            여자
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.birthBox}>
          <Text style={styles.subtext}>생년월일</Text>
          <View style={styles.statureContainer}>
            <TextInput
              style={styles.statureInput}
              placeholder='00/00/00'
              value={birth}
              onChangeText={setBirth}
            />
            <FontAwesome6
              style={styles.unit}
              name='calendar'
              size={24}
              color='black'
            />
          </View>
        </View>

        <View style={styles.halfBox}>
          <Text style={styles.subtext}>키</Text>
          <Pressable
            style={styles.statureContainer}
            onPress={() => openPicker('height')}
          >
            <Text style={[styles.statureText, !height && styles.placeholder]}>
              {height ?? '-'}
            </Text>
            <Text style={styles.unit}>cm</Text>
          </Pressable>
        </View>

        <View style={styles.halfBox}>
          <Text style={styles.subtext}>몸무게</Text>
          <Pressable
            style={styles.statureContainer}
            onPress={() => openPicker('weight')}
          >
            <Text style={[styles.statureText, !weight && styles.placeholder]}>
              {weight ?? '-'}
            </Text>
            <Text style={styles.unit}>kg</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={activePicker !== null} transparent animationType='none'>
        <View style={styles.pickerModalContainer}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closePicker}>
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
                <Text style={styles.pickerTitle}>
                  {activePicker === 'height' ? '키' : '몸무게'}
                </Text>
                <Pressable
                  onPress={closePicker}
                  hitSlop={10}
                  style={styles.pickerDoneBtn}
                >
                  <Text style={styles.pickerDone}>완료</Text>
                </Pressable>
              </View>
              <View style={styles.wheelPickerWrapper}>
                {activePicker && (
                  <WheelPicker
                    data={activePicker === 'height' ? heightData : weightData}
                    value={pickerValue}
                    onValueChanged={({ item: { value } }) =>
                      setPickerValue(value)
                    }
                    itemTextStyle={styles.pickerItemText}
                  />
                )}
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => router.push('/TierRecommend')}
      >
        <Text style={styles.nextBtnText}>다음으로</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#151515' },
  title: {
    color: 'white',
    fontSize: 28,
    marginTop: 100,
    marginLeft: 20,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    lineHeight: 35,
  },
  subscribe: {
    marginTop: 12,
    fontSize: 16,
    color: '#979797',
    fontFamily: FONT_FAMILY.REGULAR,
    marginLeft: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#979797',
    fontFamily: FONT_FAMILY.REGULAR,
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
  subtext: { color: '#979797', fontSize: 16, fontFamily: FONT_FAMILY.REGULAR },
  back: { top: 75, left: 10 },
  profileImg: {
    width: 110,
    height: 110,
    borderRadius: 70,
    backgroundColor: '#333333',
    marginTop: 20,
    alignSelf: 'center',
  },
  sheetBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#212121',
    paddingBottom: 20,
    paddingTop: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sheetInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 15,
    columnGap: 10,
  },
  applyBtn: {
    width: '100%',
    backgroundColor: '#111111',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginTop: 25,
  },
  applyBtnText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  profileText: {
    width: '100%',
    fontSize: 19,
    color: 'white',
    marginBottom: 20,
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  imgIcon: {
    position: 'absolute',
    top: 325,
    left: '54%',
    backgroundColor: '#EAEAEA',
    borderRadius: 20,
    padding: 5,
  },
  nickname: {
    height: 50,
    backgroundColor: '#212121',
    borderColor: '#3C3C3C',
    borderWidth: 1,
    borderRadius: 32,
    marginTop: 10,
    alignSelf: 'center',
    width: '90%',
    paddingHorizontal: 23,
    fontSize: 16,
    color: 'white',
    fontFamily: FONT_FAMILY.REGULAR,
  },
  genderContainer: {
    flexDirection: 'row',
    width: '50%',
    marginLeft: 20,
    marginTop: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 17,
    borderWidth: 1,
    borderColor: '#3C3C3C',
    borderRadius: 13,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  genderSelected: {
    borderColor: '#7BF179',
    color: '#7BF179',
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  genderText: {
    color: '#979797',
    fontSize: 16,
    fontFamily: FONT_FAMILY.REGULAR,
  },
  birthBox: { width: '36%' },
  halfBox: { width: '27%' },
  statureInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontFamily: FONT_FAMILY.REGULAR,
  },
  statureText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontFamily: FONT_FAMILY.REGULAR,
  },
  placeholder: { color: '#5B5B5B' },
  statureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#212121',
    borderRadius: 32,
    height: 50,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  unit: { fontSize: 16, color: '#5B5B5B' },
  nextBtn: {
    width: '90%',
    height: 60,
    backgroundColor: '#7BF179',
    borderRadius: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: '20%',
  },
  nextBtnText: {
    textAlign: 'center',
    lineHeight: 50,
    fontSize: 15,
    fontFamily: FONT_FAMILY.SEMIBOLD,
    color: '#151515',
  },
  nextBtnDisabled: { backgroundColor: '#3C3C3C', color: '#6E6E6E' },
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
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
  },
  nicknameSuccess: {
    color: '#7BF179',
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
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
    backgroundColor: '#212121',
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
    borderBottomColor: '#3C3C3C',
  },
  pickerTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  pickerDoneBtn: {
    position: 'absolute',
    right: 16,
  },
  pickerDone: {
    fontSize: 16,
    color: '#7BF179',
    fontFamily: FONT_FAMILY.SEMIBOLD,
  },
  wheelPickerWrapper: {
    overflow: 'hidden',
  },
  pickerItemText: { fontSize: 18, color: '#fff' },
});

export { Profile };
