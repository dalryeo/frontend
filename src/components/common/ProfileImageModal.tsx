import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { IMAGES } from '../../constants/Images';
import { Font } from '../Font';

interface ProfileImageModalProps {
  visible: boolean;
  selectedImg: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 6;
const SHEET_HORIZONTAL_PADDING = 20;
const PAGE_WIDTH =
  Dimensions.get('window').width - SHEET_HORIZONTAL_PADDING * 2;

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

const totalPages = Math.ceil(PROFILE_IMAGES.length / ITEMS_PER_PAGE);
const pages = Array.from({ length: totalPages }, (_, pageIndex) =>
  PROFILE_IMAGES.slice(
    pageIndex * ITEMS_PER_PAGE,
    (pageIndex + 1) * ITEMS_PER_PAGE,
  ),
);

export function ProfileImageModal({
  visible,
  selectedImg,
  onSelect,
  onClose,
}: ProfileImageModalProps) {
  const [tempSelected, setTempSelected] = useState(selectedImg);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setTempSelected(selectedImg);
      const page = Math.floor(selectedImg / ITEMS_PER_PAGE);
      setCurrentPage(page);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: page * PAGE_WIDTH, animated: false });
      }, 0);
    }
  }, [visible, selectedImg]);

  const handleApply = () => {
    onSelect(tempSelected);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType='slide'>
      <View style={styles.sheetBackground}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />

        <View style={styles.sheet}>
          <Font type='Head4' style={styles.profileText}>
            프로필 이미지를 선택해주세요
          </Font>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const page = Math.round(
                e.nativeEvent.contentOffset.x / PAGE_WIDTH,
              );
              setCurrentPage(page);
            }}
          >
            {pages.map((pageImages, pageIndex) => (
              <View key={pageIndex} style={styles.page}>
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => {
                  const index = pageIndex * ITEMS_PER_PAGE + i;
                  const getImage = pageImages[i];

                  if (!getImage) {
                    return <View key={index} />;
                  }

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setTempSelected(index)}
                      style={[
                        styles.profileImgModal,
                        {
                          backgroundColor:
                            tempSelected === index
                              ? NEUTRAL.MAIN
                              : NEUTRAL.GRAY_300,
                        },
                      ]}
                    >
                      <Image
                        source={getImage()}
                        style={styles.profileImg}
                        resizeMode='contain'
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <View style={styles.dotContainer}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      i === currentPage ? NEUTRAL.MAIN : NEUTRAL.GRAY_600,
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleApply} style={styles.applyBtn}>
            <Font type='SubButton' style={styles.applyBtnText}>
              적용하기
            </Font>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: NEUTRAL.GRAY_900,
    paddingBottom: 20,
    paddingTop: 25,
    paddingHorizontal: SHEET_HORIZONTAL_PADDING,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  page: {
    width: PAGE_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  profileImgModal: {
    width: 100,
    height: 100,
    padding: 20,
    borderRadius: 50,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  applyBtn: {
    width: '100%',
    backgroundColor: NEUTRAL.BLACK,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginTop: 16,
  },
  applyBtnText: {
    color: NEUTRAL.WHITE,
    textAlign: 'center',
  },
  profileText: {
    color: NEUTRAL.WHITE,
  },
});
