import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { startNetworkSpeed, stopNetworkSpeed } from './NetworkSpeed';

const Home = () => {
  const [download, setDownload] = useState(0);
  const [upload, setUpload] = useState(0);

  useEffect(() => {
    const sub = startNetworkSpeed(data => {
      setDownload(data.download);
      setUpload(data.upload);
    });

    return () => {
      sub.remove();
      stopNetworkSpeed();
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Download: {(download / 1024).toFixed(2)} MB/s</Text>
      <Text>Upload: {(upload / 1024).toFixed(2)} MB/s</Text>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
