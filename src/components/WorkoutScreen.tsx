/**
 * @fileoverview 운동(러닝) 화면 예제
 *
 * 해당 파일은 useWorkout 훅과 네이티브 workoutModule을 활용한 운동 추적 UI 구현 예제입니다.
 *
 * @example 기본 구조
 * ```
 * WorkoutScreen (메인)
 * ├── ReadyView      - 운동 시작 전 (권한 요청)
 * ├── ActiveView     - 운동 진행 중 (메트릭 표시, 일시정지/종료)
 * └── SummaryView    - 운동 완료 후 (결과 요약)
 * ```
 *
 * @remarks
 * - 세션 상태(sessionState)에 따라 적절한 View를 렌더링
 * - Result 패턴으로 모든 네이티브 호출의 성공/실패 처리
 * - 권한 미허용 시 설정 앱으로 유도하는 UX 플로우 포함
 */

import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  WorkoutMetrics,
  workoutModule,
  WorkoutSessionState,
} from '@/modules/workout';
import { useWorkout } from '../hooks/useWorkout';

const colors = {
  primary: '#2563eb',
  primaryLight: '#eff6ff',
  success: '#16a34a',
  successLight: '#f0fdf4',
  warning: '#ea580c',
  danger: '#dc2626',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
};

/**
 * 운동 화면 메인 컴포넌트
 *
 * @description
 * useWorkout 훅에서 제공하는 상태와 액션을 기반으로
 * 세션 상태별 적절한 UI를 렌더링합니다.
 */
export function WorkoutScreen() {
  /**
   * useWorkout 훅 반환값
   * - metrics: 실시간 운동 데이터 (거리, 페이스, 칼로리 등)
   * - sessionState: 현재 세션 상태 (NotStarted | Running | Paused | Ended)
   * - permissions: 권한 상태 { healthKit, location }
   * - hasAllPermissions: 모든 필수 권한 허용 여부
   * - isRequesting: 권한 요청 진행 중 여부
   * - requestPermissions: 권한 요청 함수
   * - checkPermissions: 권한 상태 확인 함수
   */
  const {
    metrics,
    sessionState,
    permissions,
    hasAllPermissions,
    isRequesting,
    requestPermissions,
    checkPermissions,
  } = useWorkout();

  /**
   * Health 앱 열기
   * iOS에서 HealthKit 권한은 Health 앱에서만 변경 가능
   */
  const openHealthApp = async () => {
    try {
      const canOpen = await Linking.canOpenURL('x-apple-health://');
      await Linking.openURL(canOpen ? 'x-apple-health://' : 'app-settings:');
    } catch {
      await Linking.openSettings();
    }
  };

  /**
   * 권한 필요 Alert 표시
   * @param needsHealthKit - true면 Health 앱으로, false면 설정 앱으로 이동
   */
  const showSettingsAlert = (needsHealthKit: boolean) => {
    Alert.alert(
      '권한 필요',
      '운동 기록을 위해 Health와 위치 권한이 필요합니다.',
      [
        {
          text: '설정으로 이동',
          onPress: () =>
            needsHealthKit ? openHealthApp() : Linking.openSettings(),
        },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  /**
   * 운동 시작 핸들러
   *
   * 플로우:
   * 1. 최신 권한 상태 확인 (앱이 백그라운드에 있었을 수 있음)
   * 2. 권한 미허용 시 설정으로 유도
   * 3. workoutModule.start() 호출
   * 4. Result 패턴으로 에러 처리
   */
  const handleStart = async () => {
    // 권한 상태 재확인 (사용자가 설정에서 변경했을 수 있음)
    await checkPermissions();

    if (!hasAllPermissions) {
      showSettingsAlert(!permissions.healthKit);
      return;
    }

    // 운동 시작 - Result 패턴으로 성공/실패 처리
    const result = await workoutModule.start();
    if (!result.success) Alert.alert('오류', result.error.message);
  };

  /**
   * 세션 상태별 View 렌더링
   * @remarks switch 문으로 상태별 명확한 분기 처리
   */
  const renderContent = () => {
    switch (sessionState) {
      case WorkoutSessionState.NotStarted:
        return (
          <ReadyView
            hasAllPermissions={hasAllPermissions}
            permissions={permissions}
            isRequesting={isRequesting}
            onRequestPermissions={requestPermissions}
            onStart={handleStart}
            onOpenSettings={() => showSettingsAlert(!permissions.healthKit)}
          />
        );
      case WorkoutSessionState.Running:
      case WorkoutSessionState.Paused:
        // Running과 Paused는 같은 View, 내부에서 상태별 UI 분기
        return <ActiveView metrics={metrics} sessionState={sessionState} />;
      case WorkoutSessionState.Ended:
        return <SummaryView metrics={metrics} onReset={workoutModule.reset} />;
      default:
        return null;
    }
  };

  return <View style={styles.container}>{renderContent()}</View>;
}

interface ReadyViewProps {
  hasAllPermissions: boolean;
  permissions: { healthKit: boolean; location: boolean };
  isRequesting: boolean;
  onRequestPermissions: () => void;
  onStart: () => void;
  onOpenSettings: () => void;
}

/**
 * 운동 시작 전 대기 화면
 *
 * @description
 * 권한 상태에 따라 3가지 UI 상태를 표시:
 * 1. 권한 요청 중 → 로딩 인디케이터
 * 2. 권한 미허용 → 권한 요청 카드
 * 3. 권한 허용됨 → 시작 버튼만 활성화
 *
 */
function ReadyView({
  hasAllPermissions,
  permissions,
  isRequesting,
  onRequestPermissions,
  onStart,
  onOpenSettings,
}: ReadyViewProps) {
  return (
    <View style={styles.readyContainer}>
      {/* 헤더: 운동 타입 아이콘 + 상태 텍스트 */}
      <View style={styles.readyHeader}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>R</Text>
        </View>
        <Text style={styles.title}>러닝</Text>
        <Text style={styles.subtitle}>
          {hasAllPermissions ? '준비 완료' : '권한 설정 필요'}
        </Text>
      </View>

      {/* 조건부 렌더링: 로딩 / 권한 카드 / 없음 */}
      {isRequesting ? (
        <View style={styles.statusCard}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.statusText}>권한 확인 중...</Text>
        </View>
      ) : !hasAllPermissions ? (
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>필요한 권한</Text>

          <PermissionItem label="건강 데이터" granted={permissions.healthKit} />
          <PermissionItem label="위치 정보" granted={permissions.location} />

          <Pressable
            style={styles.permissionBtn}
            onPress={onRequestPermissions}
          >
            <Text style={styles.permissionBtnText}>권한 허용하기</Text>
          </Pressable>

          {/* 시스템 권한 팝업이 더 이상 뜨지 않을 때를 위한 대안 */}
          <Pressable style={styles.linkBtn} onPress={onOpenSettings}>
            <Text style={styles.linkText}>설정에서 직접 변경</Text>
          </Pressable>
        </View>
      ) : null}

      {/* 하단 고정: 시작 버튼 */}
      <View style={styles.readyFooter}>
        <Pressable
          style={[styles.startBtn, !hasAllPermissions && styles.btnDisabled]}
          onPress={onStart}
          disabled={!hasAllPermissions || isRequesting}
        >
          <Text style={styles.startBtnText}>시작</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PermissionItem({
  label,
  granted,
}: {
  label: string;
  granted: boolean;
}) {
  return (
    <View style={styles.permissionRow}>
      <View style={[styles.statusDot, granted && styles.statusDotGranted]} />
      <Text
        style={[styles.permissionLabel, granted && styles.permissionGranted]}
      >
        {label}
      </Text>
      <Text style={styles.permissionStatus}>{granted ? '허용됨' : '필요'}</Text>
    </View>
  );
}

interface ActiveViewProps {
  metrics: WorkoutMetrics;
  sessionState: WorkoutSessionState;
}

/**
 * 운동 진행 중 화면
 *
 * @description
 * - 실시간 메트릭 표시 (useWorkout 훅이 이벤트 구독으로 자동 업데이트)
 * - Running/Paused 상태에 따른 버튼 텍스트 변경
 * - 일시정지/재개, 종료 액션 처리
 *
 * @remarks
 * metrics는 useWorkout 훅 내부에서 네이티브 이벤트를 구독하여
 * 자동으로 업데이트됩니다. 별도의 polling 불필요.
 */
function ActiveView({ metrics, sessionState }: ActiveViewProps) {
  const isRunning = sessionState === WorkoutSessionState.Running;

  /**
   * 일시정지/재개 토글
   * 현재 상태에 따라 적절한 API 호출
   */
  const togglePause = async () => {
    const result = isRunning
      ? await workoutModule.pause()
      : await workoutModule.resume();
    if (!result.success) Alert.alert('오류', result.error.message);
  };

  /**
   * 운동 종료
   * 성공 시 sessionState가 Ended로 변경되어 SummaryView로 전환됨
   */
  const handleEnd = async () => {
    const result = await workoutModule.end();
    if (!result.success) Alert.alert('오류', result.error.message);
  };

  return (
    <View style={styles.activeContainer}>
      {/* 타이머 섹션 */}
      <View style={styles.timerSection}>
        <Text style={styles.timerLabel}>경과 시간</Text>
        <Text style={styles.timerValue}>{formatTime(metrics.elapsedTime)}</Text>
        <View
          style={[styles.statusBadge, !isRunning && styles.statusBadgePaused]}
        >
          <Text style={styles.statusBadgeText}>
            {isRunning ? '운동 중' : '일시정지'}
          </Text>
        </View>
      </View>

      {/* 메트릭 그리드 (2x2) */}
      <View style={styles.metricsSection}>
        <MetricCard
          label="거리"
          value={(metrics.distance / 1000).toFixed(2)}
          unit="km"
        />
        <MetricCard
          label="페이스"
          value={formatPace(metrics.pace)}
          unit="/km"
        />
        <MetricCard
          label="칼로리"
          value={Math.round(metrics.calories).toString()}
          unit="kcal"
        />
        {/* 심박수: Apple Watch 미연결 시 null */}
        <MetricCard
          label="심박수"
          value={
            metrics.heartRate ? Math.round(metrics.heartRate).toString() : '--'
          }
          unit="bpm"
          highlight={!!metrics.heartRate}
        />
      </View>

      {/* 컨트롤 버튼 */}
      <View style={styles.controlSection}>
        <Pressable
          style={[styles.controlBtn, styles.controlBtnSecondary]}
          onPress={togglePause}
        >
          <Text style={styles.controlBtnSecondaryText}>
            {isRunning ? '일시정지' : '재개'}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.controlBtn, styles.controlBtnDanger]}
          onPress={handleEnd}
        >
          <Text style={styles.controlBtnDangerText}>종료</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MetricCard({
  label,
  value,
  unit,
  highlight = true,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text
          style={[styles.metricValue, !highlight && styles.metricValueMuted]}
        >
          {value}
        </Text>
        <Text style={styles.metricUnit}>{unit}</Text>
      </View>
    </View>
  );
}

interface SummaryViewProps {
  metrics: WorkoutMetrics;
  onReset: () => void;
}

/**
 * 운동 완료 요약 화면
 *
 * @description
 * - 최종 운동 결과 표시
 * - onReset 호출 시 sessionState가 NotStarted로 돌아가 ReadyView로 전환
 *
 * @remarks
 * 해당 시점에서 데이터는 이미 HealthKit에 저장된 상태
 * (workoutModule.end() 내부에서 처리됨)
 */
function SummaryView({ metrics, onReset }: SummaryViewProps) {
  return (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryHeader}>
        <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
          <Text style={[styles.iconText, styles.iconTextSuccess]}>✓</Text>
        </View>
        <Text style={styles.title}>운동 완료</Text>
        <Text style={styles.subtitle}>수고하셨습니다</Text>
      </View>

      {/* 결과 카드 */}
      <View style={styles.summaryCard}>
        <SummaryRow label="총 시간" value={formatTime(metrics.elapsedTime)} />
        <SummaryRow
          label="총 거리"
          value={`${(metrics.distance / 1000).toFixed(2)} km`}
        />
        <SummaryRow
          label="평균 페이스"
          value={`${formatPace(metrics.pace)} /km`}
        />
        <SummaryRow
          label="소모 칼로리"
          value={`${Math.round(metrics.calories)} kcal`}
        />
        {/* 심박수: Apple Watch로 측정된 경우에만 표시 */}
        {metrics.averageHeartRate > 0 && (
          <SummaryRow
            label="평균 심박수"
            value={`${Math.round(metrics.averageHeartRate)} bpm`}
          />
        )}
      </View>

      <View style={styles.summaryFooter}>
        <Pressable style={styles.newWorkoutBtn} onPress={onReset}>
          <Text style={styles.newWorkoutBtnText}>새 운동 시작</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** 요약 행 컴포넌트 */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

/** 숫자를 2자리 문자열로 패딩 */
const pad = (n: number) => n.toString().padStart(2, '0');

/**
 * 초를 시:분:초 또는 분:초 형식으로 변환
 * @param seconds - 경과 시간 (초)
 * @returns "1:23:45" 또는 "23:45"
 */
const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

/**
 * 페이스를 분'초" 형식으로 변환
 * @param pace - 페이스 (분/km)
 * @returns "5'30\"" 또는 "--'--\"" (유효하지 않을 때)
 */
const formatPace = (pace: number): string => {
  if (!pace || pace <= 0) return '--\'--"';
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}'${pad(secs)}"`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Common
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleSuccess: {
    backgroundColor: colors.successLight,
  },
  iconText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  iconTextSuccess: {
    color: colors.success,
  },

  // Ready View
  readyContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  readyHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  permissionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  permissionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    marginRight: 12,
  },
  statusDotGranted: {
    backgroundColor: colors.success,
  },
  permissionLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  permissionGranted: {
    color: colors.textSecondary,
  },
  permissionStatus: {
    fontSize: 13,
    color: colors.textMuted,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  permissionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 13,
    color: colors.primary,
  },
  readyFooter: {
    marginTop: 'auto',
  },
  startBtn: {
    backgroundColor: colors.success,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: colors.textMuted,
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },

  // Active View
  activeContainer: {
    flex: 1,
    paddingTop: 48,
    paddingBottom: 40,
  },
  timerSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  timerLabel: {
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    color: colors.text,
    marginVertical: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.successLight,
  },
  statusBadgePaused: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  metricsSection: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  metricCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
  metricValueMuted: {
    color: colors.textMuted,
  },
  metricUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  controlSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  controlBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  controlBtnSecondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  controlBtnDanger: {
    backgroundColor: colors.danger,
  },
  controlBtnDangerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // Summary View
  summaryContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
  summaryFooter: {
    marginTop: 'auto',
  },
  newWorkoutBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  newWorkoutBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
