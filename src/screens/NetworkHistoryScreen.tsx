import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';
import { SpeedDataPoint, getSpeedHistory } from '../utils/storage';
import { formatSpeed } from '../utils/speedUtils';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type TimeRange = '24h' | '7d';

const NetworkHistoryScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [history, setHistory] = useState<SpeedDataPoint[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SpeedDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    const storedHistory = await getSpeedHistory();
    setHistory(storedHistory);
    setIsRefreshing(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
    // Refresh history every 5 minutes
    const interval = setInterval(fetchHistory, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  useEffect(() => {
    const filterData = () => {
      const now = Date.now();
      let startTime = 0;
      if (timeRange === '24h') {
        startTime = now - 24 * 60 * 60 * 1000;
      } else if (timeRange === '7d') {
        startTime = now - 7 * 24 * 60 * 60 * 1000;
      }
      setFilteredHistory(history.filter(point => point.timestamp >= startTime));
    };
    filterData();
  }, [history, timeRange]);

  // Prepare data for the chart
  const chartData = {
    labels: filteredHistory.map(point => {
      const date = new Date(point.timestamp);
      if (timeRange === '24h') {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }),
    datasets: [
      {
        data: filteredHistory.map(point => point.download / 1000000), // Convert to MB/s for chart
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Blue for Download
        strokeWidth: 2,
        legend: 'Download (MB/s)'
      },
      {
        data: filteredHistory.map(point => point.upload / 1000000), // Convert to MB/s for chart
        color: (opacity = 1) => `rgba(76, 217, 100, ${opacity})`, // Green for Upload
        strokeWidth: 2,
        legend: 'Upload (MB/s)'
      }
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#1E2923',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#08130D',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
    propsForLabels: {
      fontSize: 10,
    },
    decimalPlaces: 2, // Set to 2 decimal places for MB/s
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchHistory} tintColor="#fff" titleColor="#fff" />
        }
      >
        <Text style={styles.headerTitle}>Network History</Text>

        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === '24h' && styles.activeTimeRangeButton]}
            onPress={() => setTimeRange('24h')}
          >
            <Text style={styles.timeRangeButtonText}>24 Hours</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === '7d' && styles.activeTimeRangeButton]}
            onPress={() => setTimeRange('7d')}
          >
            <Text style={styles.timeRangeButtonText}>7 Days</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading history...</Text>
          </View>
        ) : filteredHistory.length > 1 ? (
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={width - 40} // Subtract padding
              height={220}
              chartConfig={chartConfig}
              bezier // Smooth line chart
              style={styles.chart}
              verticalLabelRotation={30}
              formatYLabel={(yValue) => `${yValue} MB/s`} // Add MB/s unit to Y-axis labels
            />
             <View style={styles.legendContainer}>
                {chartData.datasets.map((dataset, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: dataset.color(1) }]} />
                        <Text style={styles.legendText}>{dataset.legend}</Text>
                    </View>
                ))}
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="chart-line-variant" size={60} color="rgba(255,255,255,0.6)" />
            <Text style={styles.noDataText}>No sufficient data to display chart.</Text>
            <Text style={styles.noDataSubText}>Start using the app to collect speed data!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333', // Dark background for the history screen
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  timeRangeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  activeTimeRangeButton: {
    backgroundColor: '#007AFF', // Active button color
  },
  timeRangeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chartContainer: {
    width: '95%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    width: '90%',
    minHeight: 250,
  },
  noDataText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
    textAlign: 'center',
  },
  noDataSubText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 5,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 250,
  },
  loadingText: {
    color: '#007AFF',
    marginTop: 10,
  },
});

export default NetworkHistoryScreen;
