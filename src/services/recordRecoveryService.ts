import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecordSaveRequest } from '../types/record';
import { RecordErrorType } from './recordService';

const FAILED_RECORDS_KEY = '@dalryeo/failed_records';
const EXPIRY_DAYS = 7;
const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export interface FailedRecordEntry {
  id: string;
  recordData: RecordSaveRequest;
  errorType: RecordErrorType;
  userMessage: string;
  failedAt: string;
  attemptCount: number;
}

export function isRecordExpired(entry: FailedRecordEntry): boolean {
  return Date.now() - new Date(entry.failedAt).getTime() > EXPIRY_MS;
}

export const recordRecoveryService = {
  async getFailedRecords(): Promise<FailedRecordEntry[]> {
    try {
      const data = await AsyncStorage.getItem(FAILED_RECORDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveFailedRecord(
    recordData: RecordSaveRequest,
    errorType: RecordErrorType,
    userMessage: string,
  ): Promise<FailedRecordEntry> {
    const entry: FailedRecordEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recordData,
      errorType,
      userMessage,
      failedAt: new Date().toISOString(),
      attemptCount: 1,
    };

    const failed = await this.getFailedRecords();
    failed.push(entry);
    await AsyncStorage.setItem(FAILED_RECORDS_KEY, JSON.stringify(failed));
    return entry;
  },

  async increaseAttemptCount(id: string): Promise<void> {
    const failed = await this.getFailedRecords();
    const entry = failed.find((f) => f.id === id);
    if (entry) {
      entry.attemptCount += 1;
      entry.failedAt = new Date().toISOString();
      await AsyncStorage.setItem(FAILED_RECORDS_KEY, JSON.stringify(failed));
    }
  },

  async removeFailedRecord(id: string): Promise<void> {
    const failed = await this.getFailedRecords();
    const filtered = failed.filter((f) => f.id !== id);
    await AsyncStorage.setItem(FAILED_RECORDS_KEY, JSON.stringify(filtered));
  },

  async removeMultipleFailedRecords(ids: string[]): Promise<void> {
    const failed = await this.getFailedRecords();
    const filtered = failed.filter((f) => !ids.includes(f.id));
    await AsyncStorage.setItem(FAILED_RECORDS_KEY, JSON.stringify(filtered));
  },

  async clearAllFailedRecords(): Promise<void> {
    await AsyncStorage.removeItem(FAILED_RECORDS_KEY);
  },

  async removeExpiredRecords(): Promise<number> {
    const records = await this.getFailedRecords();
    const active = records.filter((r) => !isRecordExpired(r));
    const removedCount = records.length - active.length;
    if (removedCount > 0) {
      await AsyncStorage.setItem(FAILED_RECORDS_KEY, JSON.stringify(active));
    }
    return removedCount;
  },
};
