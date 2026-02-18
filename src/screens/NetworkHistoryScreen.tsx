import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SpeedDataPoint, getSpeedHistory } from '../utils/storage';

type TimeRange = '24h' | '7d';

const COLORS = {
  primary: '#007AFF',
  success: '#4CD964',
  background: '#121212',
  cardBg: 'rgba(255, 255, 255, 0.08)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  white: '#FFFFFF',
};

const NetworkHistoryScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [history, setHistory] = useState<SpeedDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const storedHistory = await getSpeedHistory();
      setHistory(storedHistory);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(true);
    const interval = setInterval(() => fetchHistory(false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  const filteredHistory = useMemo(() => {
    const now = Date.now();
    const threshold =
      timeRange === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    return history
      .filter(point => point.timestamp >= now - threshold)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [history, timeRange]);

  const chartData = useMemo(() => {
    if (filteredHistory.length === 0) return null;

    return {
      labels: filteredHistory.map(point => {
        const date = new Date(point.timestamp);
        return timeRange === '24h'
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          data: filteredHistory.map(point => point.download / 1000000),
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          strokeWidth: 3,
          legend: 'Download (MB/s)',
        },
        {
          data: filteredHistory.map(point => point.upload / 1000000),
          color: (opacity = 1) => `rgba(76, 217, 100, ${opacity})`,
          strokeWidth: 3,
          legend: 'Upload (MB/s)',
        },
      ],
      legend: ['Download', 'Upload'],
    };
  }, [filteredHistory, timeRange]);

  const chartConfig = useMemo(
    () => ({
      backgroundGradientFrom: COLORS.background,
      backgroundGradientTo: COLORS.background,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      strokeWidth: 2,
      decimalPlaces: 1,
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: COLORS.primary,
      },
    }),
    [],
  );

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['24h', '7d'] as TimeRange[]).map(range => (
        <TouchableOpacity
          key={range}
          activeOpacity={0.7}
          style={[
            styles.timeRangeButton,
            timeRange === range && styles.activeTimeRangeButton,
          ]}
          onPress={() => setTimeRange(range)}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              timeRange === range && styles.activeTimeRangeButtonText,
            ]}
          >
            {range === '24h' ? '24 Hours' : '7 Days'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={COLORS.white}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Network History</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchHistory(false)}
            tintColor={COLORS.white}
          />
        }
      >
        {renderTimeRangeSelector()}

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Analyzing network data...</Text>
          </View>
        ) : filteredHistory.length > 1 ? (
          <View style={styles.chartWrapper}>
            <Text style={styles.chartTitle}>Speed Trends (MB/s)</Text>
            <LineChart
              data={chartData!}
              width={width - 32}
              height={240}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              verticalLabelRotation={30}
              formatYLabel={y => parseFloat(y).toFixed(1)}
              withInnerLines={false}
              withOuterLines={true}
              withHorizontalLines={true}
              withVerticalLines={false}
            />
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: COLORS.primary },
                  ]}
                />
                <Text style={styles.legendText}>Download</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: COLORS.success },
                  ]}
                />
                <Text style={styles.legendText}>Upload</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons
              name="chart-bell-curve-cumulative"
              size={80}
              color={COLORS.textSecondary}
            />
            <Text style={styles.noDataText}>No history data yet</Text>
            <Text style={styles.noDataSubText}>
              Keep the app running to track your network performance over time.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 4,
    marginVertical: 20,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTimeRangeButton: {
    backgroundColor: COLORS.primary,
  },
  timeRangeButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  activeTimeRangeButtonText: {
    color: COLORS.white,
  },
  centerContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  chartWrapper: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chartTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: 15,
    marginLeft: 8,
  },
  chart: {
    borderRadius: 16,
    marginRight: -16, // Offset internal padding of LineChart
  },
  legendContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
  },
  noDataText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 20,
  },
  noDataSubText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NetworkHistoryScreen;
