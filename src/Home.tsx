import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Dimensions, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import NetInfo, { NetInfoSubscription, NetInfoState, NetInfoCellularGeneration } from '@react-native-community/netinfo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HapticFeedback from 'react-native-haptic-feedback';
import { useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import SpeedDisplayCard from './components/SpeedDisplayCard';
import { startNetworkSpeed, stopNetworkSpeed } from './NetworkSpeed';
import { saveSpeedData } from './utils/storage'; // Import saveSpeedData

// Optional: Haptic feedback options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const getIconName = (type: NetInfoState['type'], isInternetReachable: boolean | null): string => {
  if (!isInternetReachable) {
    return 'wan-off'; // No internet
  }
  switch (type) {
    case 'wifi':
      return 'wifi';
    case 'cellular':
      return 'signal';
    case 'ethernet':
      return 'ethernet';
    case 'bluetooth':
      return 'bluetooth';
    case 'vpn':
    case 'other': // Add other types that might represent connected state
    case 'wimax':
      return 'vpn'; // Using vpn icon for generic connected, or could be 'network'
    case 'none':
    case 'unknown':
    default:
      return 'network-off-outline';
  }
};

const getBackgroundColor = (isInternetReachable: boolean | null): string => {
  if (isInternetReachable === null) {
    return '#808080'; // Unknown or initial state
  } else if (isInternetReachable) {
    return '#4CAF50'; // Green for connected
  } else {
    return '#F44336'; // Red for disconnected
  }
};

const Home = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [netInfo, setNetInfo] = useState<NetInfoState | null>(null);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);


  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const backgroundColor = useSharedValue(getBackgroundColor(null));

  const fetchNetworkInfo = useCallback(async () => {
    setIsRefreshing(true);
    const state = await NetInfo.fetch();
    setNetInfo(state);

    // This is a simplified way to get IP. In a real app, you might need a native module or a third-party API.
    // For now, let's simulate.
    if (state.isInternetReachable && state.details) {
      if (state.type === 'wifi' && (state.details as any).ipAddress) {
        setIpAddress((state.details as any).ipAddress);
      } else if (state.type === 'cellular') {
        // IP address for cellular is harder to get directly in RN, often requires external service
        setIpAddress('Not available (Cellular)');
      } else {
        setIpAddress('N/A');
      }
    } else {
      setIpAddress('Disconnected');
    }
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchNetworkInfo(); // Initial fetch

    const unsubscribeNetInfo: NetInfoSubscription = NetInfo.addEventListener(state => {
      setNetInfo(state);
      // Trigger haptic feedback on connection change
      if (Platform.OS === 'ios') {
        HapticFeedback.trigger('impactLight', hapticOptions);
      }
      backgroundColor.value = withTiming(getBackgroundColor(state.isInternetReachable));
    });

    const unsubscribeNetworkSpeed = startNetworkSpeed(data => {
      setDownloadSpeed(data.download);
      setUploadSpeed(data.upload);
      // Data is saved periodically by the interval below, to avoid too many writes.
      // If you need real-time historical data, consider saving here as well.
    });

    // Periodically save speed data every minute
    const saveInterval = setInterval(() => {
      if (downloadSpeed !== 0 || uploadSpeed !== 0) { // Only save if there's actual activity
        saveSpeedData(downloadSpeed, uploadSpeed);
      }
    }, 60000); // Save every 1 minute

    return () => {
      unsubscribeNetInfo();
      unsubscribeNetworkSpeed.remove();
      stopNetworkSpeed();
      clearInterval(saveInterval); // Clear interval on unmount
    };
  }, [fetchNetworkInfo, backgroundColor, downloadSpeed, uploadSpeed]);

  useEffect(() => {
    // Animate icon scale on network type change
    scale.value = withSpring(1.2, {}, () => {
      scale.value = withSpring(1);
    });
    opacity.value = withTiming(0.8, { duration: 300 }, () => {
      opacity.value = withTiming(1, { duration: 300 });
    });
  }, [netInfo?.type, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: backgroundColor.value,
    };
  });

  const getCellularGeneration = (gen: NetInfoCellularGeneration | null | undefined) => {
    if (gen) {
      return `Cellular Gen: ${gen.toUpperCase()}`;
    }
    return 'N/A';
  };

  const navigateToHistory = useCallback(() => {
    navigation.navigate('NetworkHistory'); // Navigate to new history screen
  }, [navigation]);

  return (
    <Animated.View style={[styles.container, { paddingTop: insets.top }, animatedBackgroundStyle]}>
      <ScrollView
        contentContainerStyle={[styles.scrollViewContent, { minHeight: height - insets.top - insets.bottom }]}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchNetworkInfo} tintColor="#fff" titleColor="#fff" />
        }
      >
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, animatedStyle]}>
            <MaterialCommunityIcons
              name={getIconName(netInfo?.type || 'unknown', netInfo?.isInternetReachable)}
              size={width * 0.3}
              color="#fff"
            />
          </Animated.View>

          <Text style={styles.statusText}>
            {netInfo?.isInternetReachable === null ? 'Detecting...' : (netInfo?.isInternetReachable ? 'Connected' : 'Disconnected')}
          </Text>
          {netInfo?.isInternetReachable !== null && (
            <Text style={styles.typeText}>
              {netInfo?.type ? `Type: ${netInfo.type.toUpperCase()}` : 'Unknown'}
            </Text>
          )}

          {netInfo?.isInternetReachable && netInfo.details && (
            <View style={styles.detailsContainer}>
              {netInfo.type === 'wifi' && (netInfo.details as any).ssid && (
                <Text selectable style={styles.detailText}>
                  SSID: {(netInfo.details as any).ssid}
                </Text>
              )}
              {ipAddress && (
                <Text selectable style={styles.detailText}>
                  IP Address: {ipAddress}
                </Text>
              )}
              {netInfo.type === 'cellular' && (
                <Text selectable style={styles.detailText}>
                  {getCellularGeneration((netInfo.details as any)?.cellularGeneration)}
                </Text>
              )}
              {netInfo.details.hasOwnProperty('strength') && (
                <Text selectable style={styles.detailText}>
                  Strength: {netInfo.details.strength}%
                </Text>
              )}
            </View>
          )}

          {!netInfo?.isInternetReachable && netInfo?.isInternetReachable !== null && (
            <Text style={styles.noInternetText}>No internet connection detected.</Text>
          )}

          <SpeedDisplayCard downloadSpeed={downloadSpeed} uploadSpeed={uploadSpeed} />

          <TouchableOpacity onPress={navigateToHistory} style={styles.historyButton}>
            <Text style={styles.historyButtonText}>View Network History</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20, // Give some padding at the bottom for scroll view
    gap: 20, // Using flex gap
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    gap: 20, // Using flex gap
  },
  iconContainer: {
    padding: 20,
    borderRadius: 100, // Make it a circle
    backgroundColor: 'rgba(255,255,255,0.2)', // Semi-transparent background for the icon
    marginBottom: 20,
    aspectRatio: 1, // Ensure it's a perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8, // Android shadow
  },
  statusText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  typeText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 30,
    textAlign: 'center',
  },
  detailsContainer: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
    gap: 8, // Using flex gap
  },
  detailText: {
    fontSize: 16,
    color: '#fff',
  },
  noInternetText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 20,
    textAlign: 'center',
  },
  historyButton: {
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Home;
