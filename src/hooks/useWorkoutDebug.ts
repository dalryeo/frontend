import { useEventListener } from 'expo';
import { useCallback, useEffect, useState } from 'react';

import WorkoutModuleNative, {
  WatchState,
  WorkoutMetrics,
  WorkoutMode,
  workoutModule,
  WorkoutSessionState,
} from '@/modules/workout';
import { useWorkoutPermissions } from './useWorkoutPermissions';

export type LogType = 'event' | 'action' | 'error';

export interface DebugLogEntry {
  identifier: string;
  timestamp: Date;
  logType: LogType;
  eventName: string;
  payload?: unknown;
}

export const useWorkoutDebug = () => {
  const permissions = useWorkoutPermissions();
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);
  const [currentSessionState, setCurrentSessionState] =
    useState<WorkoutSessionState>(WorkoutSessionState.NotStarted);
  const [currentMetrics, setCurrentMetrics] = useState<WorkoutMetrics | null>(
    null,
  );
  const [currentMode, setCurrentMode] = useState<
    WorkoutMode | 'Checking...' | 'Error' | 'iPhoneOnly' | 'watchMirroring'
  >('Checking...');

  const [watchState, setWatchState] = useState<WatchState>({
    isPaired: false,
    isWatchAppInstalled: false,
    isReachable: false,
    isFallback: false,
    isWatchMode: false,
  });

  const appendLog = useCallback(
    (logType: LogType, eventName: string, payload?: unknown) => {
      setLogs((previousLogs) => [
        {
          identifier: Math.random().toString(36).substring(2, 11),
          timestamp: new Date(),
          logType,
          eventName,
          payload,
        },
        ...previousLogs,
      ]);
    },
    [],
  );

  const checkCurrentMode = useCallback(async () => {
    appendLog('action', '[Call] workoutModule.getWorkoutMode');
    const result = await workoutModule.getWorkoutMode();

    if (result.success) {
      setCurrentMode(result.data);
      appendLog('action', '[Result] workoutModule.getWorkoutMode', {
        mode: result.data,
      });
    } else {
      appendLog('error', '[Exception] workoutModule.getWorkoutMode');
      setCurrentMode('Error');
    }
  }, [appendLog]);

  useEffect(() => {
    checkCurrentMode();
  }, [checkCurrentMode]);

  const syncInitialState = useCallback(async () => {
    appendLog('action', '[Sync] 네이티브 상태 요청 (syncWatchState)');
    // 네이티브에 onWatchStateChange 이벤트를 쏴달라고 요청.
    await workoutModule.syncWatchState();
  }, [appendLog]);

  useEffect(() => {
    //  앱이 켜지고 리스너들이 등록된 직후에 호출
    syncInitialState();
  }, [syncInitialState]);

  // --- 네이티브 이벤트 리스너 ---

  useEventListener(WorkoutModuleNative, 'onMetricsUpdate', (eventPayload) => {
    setCurrentMetrics(eventPayload);
    appendLog('event', 'onMetricsUpdate', eventPayload);
  });

  useEventListener(
    WorkoutModuleNative,
    'onWatchStateChange',
    (eventPayload) => {
      setWatchState(eventPayload);
      appendLog('event', 'onWatchStateChange', eventPayload);

      // 성공 여부에 따라 모드 UI 결정
      if (eventPayload.isWatchMode) {
        setCurrentMode('watchMirroring');
      } else {
        setCurrentMode('iPhoneOnly');
      }

      if (eventPayload.isFallback) {
        setCurrentMode('iPhoneOnly');
        appendLog('error', '워치 응답 없음 -> 아이폰 단독 모드 자동 전환');
      }
    },
  );

  useEventListener(
    WorkoutModuleNative,
    'onWorkoutStateChange',
    (eventPayload) => {
      setCurrentSessionState(eventPayload.sessionState);
      appendLog('event', 'onWorkoutStateChange', eventPayload);
    },
  );

  useEventListener(WorkoutModuleNative, 'onWorkoutError', (eventPayload) => {
    appendLog('error', 'onWorkoutError', eventPayload);
  });

  useEventListener(
    WorkoutModuleNative,
    'onLocationAuthChange',
    (eventPayload) => {
      appendLog('event', 'onLocationAuthChange', eventPayload);
    },
  );

  const executeActionWithLog = async (
    actionName: string,
    actionFunction: () => Promise<unknown> | unknown,
  ) => {
    appendLog('action', `[Call] ${actionName}`);
    try {
      const result = await Promise.resolve(actionFunction());
      appendLog('action', `[Result] ${actionName}`, result);
      return result;
    } catch (error) {
      appendLog('error', `[Exception] ${actionName}`, error);
      throw error;
    }
  };

  return {
    logs,
    clearLogs: () => setLogs([]),
    currentSessionState,
    currentMetrics,
    permissions,
    executeActionWithLog,
    currentMode,
    checkCurrentMode,
    watchState,
  };
};
