import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { workoutModule } from '@/modules/workout';
import { DebugLogEntry, useWorkoutDebug } from '@/src/hooks/useWorkoutDebug';
import { SafeAreaView } from 'react-native-safe-area-context';

export const WorkoutDebugScreen = () => {
  const {
    logs,
    clearLogs,
    currentSessionState,
    permissions,
    executeActionWithLog,
    currentMode,
    checkCurrentMode,
    watchState,
  } = useWorkoutDebug();

  const {
    isPaired,
    isWatchAppInstalled,
    isReachable,
    isFallback,
    isWatchMode,
  } = watchState;

  // 상태 바 렌더링을 위한 헬퍼
  const getStatusDisplay = () => {
    if (isFallback)
      return { label: '📱 Fallback 모드 (iPhone 측정 중)', color: '#64748b' };
    if (!isPaired)
      return { label: '📱 iPhone 단독 모드 (페어링 없음)', color: '#94a3b8' };
    if (!isWatchAppInstalled)
      return { label: '⌚️ 워치 앱 설치 필요', color: '#dc2626' };

    // 핑 응답 여부에 따른 구분
    if (isReachable) {
      return { label: '⌚️ 워치 연결됨 (실시간 통신 가능)', color: '#16a34a' };
    } else {
      return {
        label: '⌚️ 워치 대기 중 (시작 시 깨우기 실행)',
        color: '#f59e0b',
      };
    }
  };

  const status = getStatusDisplay();

  const handleStart = () =>
    executeActionWithLog('workoutModule.start', () => workoutModule.start());
  const handlePause = () =>
    executeActionWithLog('workoutModule.pause', () => workoutModule.pause());
  const handleResume = () =>
    executeActionWithLog('workoutModule.resume', () => workoutModule.resume());
  const handleEnd = () =>
    executeActionWithLog('workoutModule.end', () => workoutModule.end());
  const handleReset = () =>
    executeActionWithLog('workoutModule.reset', () => workoutModule.reset());

  const handleGetMetrics = () =>
    executeActionWithLog('workoutModule.getCurrentMetrics', () =>
      workoutModule.getCurrentMetrics(),
    );

  const handleCheckPermissions = () =>
    executeActionWithLog('permissions.checkPermissions', () =>
      permissions.checkPermissions(),
    );
  const handleRequestAllPermissions = () =>
    executeActionWithLog('permissions.requestPermissions', () =>
      permissions.requestPermissions(),
    );

  const renderLogItem = (logEntry: DebugLogEntry) => {
    const timeString = logEntry.timestamp.toLocaleTimeString();

    let containerStyle = styles.logItemEvent;
    if (logEntry.logType === 'action') containerStyle = styles.logItemAction;
    if (logEntry.logType === 'error') containerStyle = styles.logItemError;

    return (
      <View
        key={logEntry.identifier}
        style={[styles.logItemContainer, containerStyle]}
      >
        <View style={styles.logHeader}>
          <Text style={styles.logTime}>{timeString}</Text>
          <Text style={styles.logName}>{logEntry.eventName}</Text>
        </View>
        {logEntry.payload ? (
          <Text style={styles.logPayload}>
            {JSON.stringify(logEntry.payload, null, 2)}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 상단 상태 바 (워치 모드 시각화) */}
        <View style={[styles.statusBanner, { backgroundColor: status.color }]}>
          <Text style={styles.statusBannerText}>{status.label}</Text>
        </View>

        {/* 1. Current State (상태 요약) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Current State</Text>
          <Text style={styles.stateText}>
            Native Manager:{' '}
            {isWatchMode ? 'WatchLed (Mirroring)' : 'iPhoneOnly'}
          </Text>
          <Text style={styles.stateText}>UI Mode: {currentMode}</Text>
          <Text style={styles.stateText}>Session: {currentSessionState}</Text>
          <Text style={styles.stateText}>
            Details: Paired({isPaired ? 'O' : 'X'}) / App(
            {isWatchAppInstalled ? 'O' : 'X'}) / Reachable(
            {isReachable ? 'O' : 'X'})
          </Text>
          <Text style={styles.stateText}>
            Permissions: Health({permissions.permissions.healthKit ? 'O' : 'X'})
            / Loc({permissions.permissions.location ? 'O' : 'X'})
          </Text>
        </View>

        {/* 2. Controls (액션 트리거) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Controls</Text>
          <View style={styles.buttonRow}>
            <ActionButton title='Start' onPress={handleStart} color='#2563eb' />
            <ActionButton title='Pause' onPress={handlePause} color='#ea580c' />
            <ActionButton
              title='Resume'
              onPress={handleResume}
              color='#16a34a'
            />
          </View>
          <View style={styles.buttonRow}>
            <ActionButton title='End' onPress={handleEnd} color='#dc2626' />
            <ActionButton title='Reset' onPress={handleReset} color='#64748b' />
            <ActionButton
              title='Get Metrics'
              onPress={handleGetMetrics}
              color='#475569'
            />
          </View>
          <View style={styles.buttonRow}>
            <ActionButton
              title='권한 체크'
              onPress={handleCheckPermissions}
              color='#8b5cf6'
            />
            <ActionButton
              title='권한 요청'
              onPress={handleRequestAllPermissions}
              color='#8b5cf6'
            />
            <ActionButton
              title='Check Mode'
              onPress={checkCurrentMode}
              color='#0891b2'
            />
          </View>
          <View style={styles.buttonRow}>
            <ActionButton
              title='로그 삭제'
              onPress={clearLogs}
              color='#ef4444'
            />
          </View>
        </View>

        {/* 3. Event Console (로그 뷰) */}
        <View style={[styles.sectionContainer, styles.logSection]}>
          <Text style={styles.sectionTitle}>Event Console</Text>
          <ScrollView style={styles.logScrollView}>
            {logs.length === 0 ? (
              <Text style={styles.emptyLogText}>Waiting for events...</Text>
            ) : (
              logs.map(renderLogItem)
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const ActionButton = ({
  title,
  onPress,
  color,
}: {
  title: string;
  onPress: () => void;
  color: string;
}) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: color }]}
    onPress={onPress}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  statusBanner: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBannerText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
  sectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    color: '#334155',
    textTransform: 'uppercase',
  },
  stateText: { fontSize: 13, color: '#475569', marginBottom: 4 },
  buttonRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  logSection: { flex: 1, paddingBottom: 20 },
  logScrollView: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  emptyLogText: { color: '#94a3b8', textAlign: 'center', marginTop: 20 },
  logItemContainer: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  logItemEvent: { backgroundColor: '#ffffff', borderLeftColor: '#3b82f6' },
  logItemAction: { backgroundColor: '#ffffff', borderLeftColor: '#10b981' },
  logItemError: { backgroundColor: '#ffffff', borderLeftColor: '#ef4444' },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logTime: { fontSize: 10, color: '#94a3b8' },
  logName: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' },
  logPayload: { fontSize: 11, color: '#64748b', marginTop: 4 },
});
