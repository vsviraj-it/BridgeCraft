import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatSpeed } from '../utils/speedUtils';
import CircularProgressBar from './CircularProgressBar';

interface SpeedDisplayCardProps {
  downloadSpeed: number; // in bytes per second
  uploadSpeed: number; // in bytes per second
}

const MAX_SPEED = 50000000; // Example max speed in Bytes/s (50 MB/s), adjust as needed

const SpeedDisplayCard: React.FC<SpeedDisplayCardProps> = ({ downloadSpeed, uploadSpeed }) => {
  const radius = 50;
  const strokeWidth = 10;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Network Speed</Text>
      <View style={styles.progressContainer}>
        <CircularProgressBar
          progress={downloadSpeed}
          maxProgress={MAX_SPEED}
          radius={radius}
          strokeWidth={strokeWidth}
          backgroundColor="#e0e0e0"
          strokeColor="#007AFF"
          label="Download"
        />
        <CircularProgressBar
          progress={uploadSpeed}
          maxProgress={MAX_SPEED}
          radius={radius}
          strokeWidth={strokeWidth}
          backgroundColor="#e0e0e0"
          strokeColor="#4CD964" // Green for upload
          label="Upload"
        />
      </View>
      <View style={styles.speedTextContainer}>
        <View style={styles.speedItem}>
          <Text style={styles.speedLabel}>Download:</Text>
          <Text style={styles.speedValue}>{formatSpeed(downloadSpeed)}</Text>
        </View>
        <View style={styles.speedItem}>
          <Text style={styles.speedLabel}>Upload:</Text>
          <Text style={styles.speedValue}>{formatSpeed(uploadSpeed)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '90%',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  speedTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  speedItem: {
    alignItems: 'center',
  },
  speedLabel: {
    fontSize: 16,
    color: '#666',
  },
  speedValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default SpeedDisplayCard;
