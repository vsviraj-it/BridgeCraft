import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'networkSpeedHistory';
const MAX_HISTORY_DAYS = 7; // Keep 7 days of history

export interface SpeedDataPoint {
  timestamp: number; // Unix timestamp
  download: number; // in bytes per second
  upload: number; // in bytes per second
}

/**
 * Saves a new network speed data point to AsyncStorage.
 * Prunes old data to keep only MAX_HISTORY_DAYS.
 */
export const saveSpeedData = async (download: number, upload: number): Promise<void> => {
  try {
    const now = Date.now();
    const newDataPoint: SpeedDataPoint = { timestamp: now, download, upload };

    const existingHistoryJson = await AsyncStorage.getItem(HISTORY_KEY);
    let history: SpeedDataPoint[] = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];

    // Add new data point
    history.push(newDataPoint);

    // Prune old data: keep only data from the last MAX_HISTORY_DAYS
    const sevenDaysAgo = now - MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000;
    history = history.filter(point => point.timestamp >= sevenDaysAgo);

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save network speed data:', error);
  }
};

/**
 * Retrieves all stored network speed data points.
 */
export const getSpeedHistory = async (): Promise<SpeedDataPoint[]> => {
  try {
    const existingHistoryJson = await AsyncStorage.getItem(HISTORY_KEY);
    return existingHistoryJson ? JSON.parse(existingHistoryJson) : [];
  } catch (error) {
    console.error('Failed to retrieve network speed history:', error);
    return [];
  }
};

/**
 * Clears all network speed history.
 */
export const clearSpeedHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    console.log('Network speed history cleared.');
  } catch (error) {
    console.error('Failed to clear network speed history:', error);
  }
};
