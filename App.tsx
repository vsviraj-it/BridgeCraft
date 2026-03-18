import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectScreen from './src/screens/agentWatch/ConnectScreen';
import AgentWatchScreen from './src/screens/agentWatch/AgentWatchScreen';

const STORAGE_KEY = 'agentwatch_bridge_url';

const App = () => {
  const [bridgeUrl, setBridgeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(_saved => {
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  if (!bridgeUrl) {
    return <ConnectScreen onConnect={setBridgeUrl} />;
  }

  return (
    <AgentWatchScreen
      bridgeUrl={bridgeUrl}
      onDisconnect={() => setBridgeUrl(null)}
    />
  );
};

export default App;
