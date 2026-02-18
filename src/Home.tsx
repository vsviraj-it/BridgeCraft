import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import NetInfo, {
  NetInfoSubscription,
  NetInfoState,
  NetInfoCellularGeneration,
} from '@react-native-community/netinfo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HapticFeedback from 'react-native-haptic-feedback';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import SpeedDisplayCard from './components/SpeedDisplayCard';
import { startNetworkSpeed, stopNetworkSpeed } from './NetworkSpeed';
import { saveSpeedData } from './utils/storage';

const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const getIconName = (
  type: NetInfoState['type'],
  isInternetReachable: boolean | null,
): string => {
  if (!isInternetReachable) return 'wan-off';
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
    case 'other':
    case 'wimax':
      return 'vpn';
    default:
      return 'network-off-outline';
  }
};

const COLORS = {
  connected: '#4CAF50',
  disconnected: '#F44336',
  unknown: '#808080',
  white: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  containerBg: 'rgba(255, 255, 255, 0.15)',
};

const Home = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [netInfo, setNetInfo] = useState<NetInfoState | null>(null);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);

  // Refs to store latest speeds for periodic saving without effect dependency issues
  const latestDownloadSpeed = useRef(0);
  const latestUploadSpeed = useRef(0);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const statusColor = useSharedValue(0); // 0: unknown, 1: connected, 2: disconnected

  const fetchNetworkInfo = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const state = await NetInfo.fetch();
      setNetInfo(state);
      updateIP(state);
    } catch (err) {
      console.error('Failed to fetch network info', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const updateIP = (state: NetInfoState) => {
    if (state.isInternetReachable && state.details) {
      if (state.type === 'wifi' && (state.details as any).ipAddress) {
        setIpAddress((state.details as any).ipAddress);
      } else if (state.type === 'cellular') {
        setIpAddress('Cellular Connection');
      } else {
        setIpAddress('N/A');
      }
    } else {
      setIpAddress('Disconnected');
    }
  };

  useEffect(() => {
    fetchNetworkInfo();

    const unsubscribeNetInfo: NetInfoSubscription = NetInfo.addEventListener(
      state => {
        setNetInfo(state);
        updateIP(state);

        if (Platform.OS === 'ios') {
          HapticFeedback.trigger('impactLight', HAPTIC_OPTIONS);
        }

        let colorVal = 0;
        if (state.isInternetReachable === true) colorVal = 1;
        else if (state.isInternetReachable === false) colorVal = 2;
        statusColor.value = withTiming(colorVal, { duration: 500 });
      },
    );

    const unsubscribeNetworkSpeed = startNetworkSpeed(data => {
      setDownloadSpeed(data.download);
      setUploadSpeed(data.upload);
      latestDownloadSpeed.current = data.download;
      latestUploadSpeed.current = data.upload;
    });

    const saveInterval = setInterval(() => {
      if (latestDownloadSpeed.current > 0 || latestUploadSpeed.current > 0) {
        saveSpeedData(latestDownloadSpeed.current, latestUploadSpeed.current);
      }
    }, 60000);

    return () => {
      unsubscribeNetInfo();
      unsubscribeNetworkSpeed.remove();
      stopNetworkSpeed();
      clearInterval(saveInterval);
    };
  }, [fetchNetworkInfo]);

  useEffect(() => {
    scale.value = withSpring(1.15, {}, () => {
      scale.value = withSpring(1);
    });
    opacity.value = withTiming(0.7, { duration: 200 }, () => {
      opacity.value = withTiming(1, { duration: 200 });
    });
  }, [netInfo?.type]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      statusColor.value,
      [0, 1, 2],
      [COLORS.unknown, COLORS.connected, COLORS.disconnected],
    ),
  }));

  const getCellularGeneration = (
    gen: NetInfoCellularGeneration | null | undefined,
  ) => {
    return gen ? `Cellular Gen: ${gen.toUpperCase()}` : 'N/A';
  };

  const navigateToHistory = useCallback(() => {
    navigation.navigate('NetworkHistory');
  }, [navigation]);

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top },
        animatedBackgroundStyle,
      ]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollViewContent,
          { minHeight: height - insets.top - insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={fetchNetworkInfo}
            tintColor="#fff"
          />
        }
      >
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, animatedStyle]}>
            <MaterialCommunityIcons
              name={getIconName(
                netInfo?.type || 'unknown',
                netInfo?.isInternetReachable,
              )}
              size={width * 0.25}
              color={COLORS.white}
            />
          </Animated.View>

          <View style={styles.textContainer}>
            <Text style={styles.statusText}>
              {netInfo?.isInternetReachable === null
                ? 'Detecting...'
                : netInfo?.isInternetReachable
                ? 'Connected'
                : 'Disconnected'}
            </Text>
            {netInfo?.isInternetReachable !== null && (
              <Text style={styles.typeText}>
                {netInfo?.type
                  ? `Type: ${netInfo.type.toUpperCase()}`
                  : 'Unknown Connection'}
              </Text>
            )}
          </View>

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
                  {getCellularGeneration(
                    (netInfo.details as any)?.cellularGeneration,
                  )}
                </Text>
              )}
              {netInfo.details.hasOwnProperty('strength') && (
                <Text selectable style={styles.detailText}>
                  Signal Strength: {netInfo.details.strength}%
                </Text>
              )}
            </View>
          )}

          {!netInfo?.isInternetReachable &&
            netInfo?.isInternetReachable !== null && (
              <Text style={styles.noInternetText}>
                No internet connection detected.
              </Text>
            )}

          <SpeedDisplayCard
            downloadSpeed={downloadSpeed}
            uploadSpeed={uploadSpeed}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={navigateToHistory}
            style={styles.historyButton}
          >
            <Text style={styles.historyButtonText}>View Network History</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.white}
            />
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
    paddingBottom: 30,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 25,
    width: '100%',
  },
  iconContainer: {
    padding: 30,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  statusText: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  typeText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 5,
    fontWeight: '500',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: COLORS.containerBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailText: {
    fontSize: 16,
    color: COLORS.white,
    marginVertical: 4,
    fontWeight: '500',
  },
  noInternetText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginVertical: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  historyButton: {
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});

export default Home;
