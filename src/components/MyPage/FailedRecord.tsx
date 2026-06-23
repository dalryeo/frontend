import { useAuth } from '@/src/contexts/AuthContext';
import { useToast } from '@/src/contexts/ToastContext';
import {
  FailedRecordEntry,
  recordRecoveryService,
} from '@/src/services/recordRecoveryService';
import { recordService } from '@/src/services/recordService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { NEUTRAL } from '../../constants/Colors';
import { Font } from '../Font';

export default function FailedRecordsScreen() {
  const [failedRecords, setFailedRecords] = useState<FailedRecordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState<Record<string, boolean>>({});
  const { getAccessToken } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const loadFailedRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await recordRecoveryService.getFailedRecords();
      setFailedRecords(records);
    } catch {
      showToast('기록 불러오기 실패');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadFailedRecords();
  }, [loadFailedRecords]);

  const handleRetry = async (entry: FailedRecordEntry) => {
    setIsRetrying((prev) => ({ ...prev, [entry.id]: true }));
    try {
      const token = await getAccessToken();
      if (!token) {
        showToast('로그인 정보 만료. 다시 로그인해주세요.');
        setIsRetrying((prev) => ({ ...prev, [entry.id]: false }));
        return;
      }

      await recordService.saveRecord(entry.recordData, token);
      await recordRecoveryService.removeFailedRecord(entry.id);
      setFailedRecords((prev) => prev.filter((r) => r.id !== entry.id));
      showToast('기록이 저장되었습니다!');
    } catch {
      await recordRecoveryService.increaseAttemptCount(entry.id);
      setFailedRecords(await recordRecoveryService.getFailedRecords());
      showToast('재시도 실패. 다시 시도해주세요.');
    } finally {
      setIsRetrying((prev) => ({ ...prev, [entry.id]: false }));
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('삭제 확인', '이 기록을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await recordRecoveryService.removeFailedRecord(id);
          setFailedRecords((prev) => prev.filter((r) => r.id !== id));
          showToast('기록이 삭제되었습니다.');
        },
      },
    ]);
  };

  const handleRetryAll = () => {
    if (failedRecords.length === 0) return;
    Alert.alert(
      '모두 재시도',
      `${failedRecords.length}개의 기록을 다시 저장하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '재시도',
          onPress: async () => {
            setIsLoading(true);
            for (const record of failedRecords) {
              await handleRetry(record);
            }
            setIsLoading(false);
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    if (failedRecords.length === 0) return;
    Alert.alert(
      '모두 삭제',
      `${failedRecords.length}개의 기록을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            await recordRecoveryService.clearAllFailedRecords();
            setFailedRecords([]);
            showToast('모든 기록이 삭제되었습니다.');
          },
        },
      ],
    );
  };

  const getErrorBorderColor = (errorType: string) => {
    if (errorType === 'NETWORK_ERROR') return { borderLeftColor: '#FF8C42' };
    if (errorType === 'SERVER_ERROR') return { borderLeftColor: '#FFB800' };
    return { borderLeftColor: NEUTRAL.DANGER };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
  };

  const renderRecord = ({ item }: { item: FailedRecordEntry }) => (
    <View style={[styles.recordCard, getErrorBorderColor(item.errorType)]}>
      <Font type='Body5' style={styles.recordTitle}>
        {(item.recordData.distanceKm || 0).toFixed(2)} km ·{' '}
        {Math.floor(item.recordData.durationSec / 60)}분
      </Font>
      <Font type='Caption' style={styles.recordInfo}>
        저장 실패: {formatDate(item.failedAt)}
      </Font>
      <Font type='Caption' style={styles.recordInfo}>
        재시도 {item.attemptCount}회
      </Font>
      <Font type='Caption' style={styles.errorMessage}>
        {item.userMessage}
      </Font>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={() => handleRetry(item)}
          disabled={isRetrying[item.id]}
        >
          <Font type='Body6' style={styles.retryButtonText}>
            {isRetrying[item.id] ? '재시도 중...' : '다시 저장'}
          </Font>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Font type='Body6' style={styles.deleteButtonText}>
            삭제
          </Font>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name='chevron-back'
          size={24}
          style={styles.backIcon}
          onPress={() => router.back()}
        />
        <Font type='Head5' style={styles.headerTitle}>
          저장 실패 기록
        </Font>
      </View>

      {failedRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Font type='Body4' style={styles.emptyText}>
            저장에 실패한 기록이 없습니다.{'\n'}모든 기록이 정상적으로
            저장되었어요!
          </Font>
        </View>
      ) : (
        <>
          <Font type='Caption' style={styles.countText}>
            {failedRecords.length}개 기록
          </Font>
          <FlatList
            data={failedRecords}
            renderItem={renderRecord}
            keyExtractor={(item) => item.id}
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            onRefresh={loadFailedRecords}
            refreshing={isLoading}
          />
        </>
      )}

      {failedRecords.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, styles.retryAllButton]}
            onPress={handleRetryAll}
          >
            <Font type='Body6' style={styles.retryAllButtonText}>
              모두 재시도
            </Font>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.clearAllButton]}
            onPress={handleClearAll}
          >
            <Font type='Body6'>모두 삭제</Font>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  header: {
    paddingTop: 75,
    paddingBottom: 20,
    backgroundColor: NEUTRAL.BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    position: 'absolute',
    top: 75,
    left: 10,
    color: NEUTRAL.WHITE,
  },
  headerTitle: {
    color: NEUTRAL.WHITE,
  },
  countText: {
    color: NEUTRAL.GRAY_500,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: NEUTRAL.GRAY_500,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  recordCard: {
    backgroundColor: NEUTRAL.GRAY_900,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  recordTitle: {
    color: NEUTRAL.WHITE,
    marginBottom: 8,
  },
  recordInfo: {
    color: NEUTRAL.GRAY_500,
    marginBottom: 4,
  },
  errorMessage: {
    color: NEUTRAL.DANGER,
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: NEUTRAL.MAIN,
  },
  deleteButton: {
    backgroundColor: NEUTRAL.GRAY_800,
  },
  retryButtonText: {
    color: NEUTRAL.BLACK,
  },
  deleteButtonText: {
    color: NEUTRAL.WHITE,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: NEUTRAL.GRAY_800,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: NEUTRAL.BACKGROUND,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryAllButton: {
    backgroundColor: NEUTRAL.MAIN,
  },
  clearAllButton: {
    backgroundColor: NEUTRAL.GRAY_800,
    color: NEUTRAL.DANGER,
  },
  retryAllButtonText: {
    color: NEUTRAL.BLACK,
  },
});
