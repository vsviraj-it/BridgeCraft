import React, { useState, useEffect, useCallback } from 'react';
console.log('[ConnectScreen] Component initialized and ready for bridge connection');
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Keyboard,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'agentwatch_bridge_url';
const RECENT_KEY = 'agentwatch_recent_urls';

interface ConnectScreenProps {
  onConnect: (wsUrl: string) => void;
}

const ConnectScreen: React.FC<ConnectScreenProps> = ({ onConnect }) => {
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [recentUrls, setRecentUrls] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setUrl(saved);
      const recent = await AsyncStorage.getItem(RECENT_KEY);
      if (recent) {
        try {
          setRecentUrls(JSON.parse(recent));
        } catch {}
      }
    };
    init();
  }, []);

  const saveUrl = useCallback(
    async (wsUrl: string) => {
      await AsyncStorage.setItem(STORAGE_KEY, wsUrl);
      const updated = [wsUrl, ...recentUrls.filter(u => u !== wsUrl)].slice(0, 5);
      setRecentUrls(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recentUrls],
  );

  const testAndConnect = useCallback(async () => {
    Keyboard.dismiss();
    let input = url.trim();
    if (!input) {
      setError('Enter a URL');
      return;
    }

    setTesting(true);
    setError('');

    if (input.startsWith('https://')) {
      input = input.replace('https://', 'wss://');
    } else if (input.startsWith('http://')) {
      input = input.replace('http://', 'ws://');
    } else if (!input.startsWith('ws://') && !input.startsWith('wss://')) {
      input = (input.includes('ngrok') || input.includes('.app')) ? `wss://${input}` : `ws://${input}`;
    }

    try {
      const ws = new WebSocket(input);
      const timeout = setTimeout(() => {
        ws.close();
        setTesting(false);
        setError('Connection timed out. Ensure the bridge server is running.');
      }, 8000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        setTesting(false);
        saveUrl(input);
        onConnect(input);
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        setTesting(false);
        setError('Could not connect. Check the URL and server status.');
      };
    } catch (e: any) {
      setTesting(false);
      setError(e.message || 'Invalid URL');
    }
  }, [url, onConnect, saveUrl]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <View style={styles.logoBox}><Text style={styles.logoText}>AW</Text></View>
          <Text style={styles.title}>AgentWatch</Text>
          <Text style={styles.subtitle}>Connect to your IDE bridge server</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Bridge Server URL</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={t => { setUrl(t); setError(''); }}
            placeholder="e.g. 192.168.1.42:3001"
            placeholderTextColor="#585858"
            autoCapitalize="none"
            keyboardType="url"
            onSubmitEditing={testAndConnect}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={[styles.connectBtn, testing && styles.connectBtnDisabled]} onPress={testAndConnect} disabled={testing}>
            {testing ? <ActivityIndicator color="#fff" /> : <Text style={styles.connectBtnText}>Connect</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent</Text>
          {recentUrls.map((u, i) => (
            <TouchableOpacity key={i} style={styles.recentItem} onPress={() => { setUrl(u); setError(''); }}>
              <Text style={styles.recentUrl} numberOfLines={1}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Quick Connect Tips</Text>
          <Text style={styles.helpText}>• Use your local IP for WiFi debugging.</Text>
          <Text style={styles.helpText}>• Use ngrok if you are on a different network.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  content: { padding: 24, paddingTop: 60 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 72, height: 72, borderRadius: 18, backgroundColor: '#007acc', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  title: { color: '#d4d4d4', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#858585', fontSize: 14, marginTop: 4 },
  inputSection: { marginBottom: 30 },
  label: { color: '#858585', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: '#2d2d2d', borderRadius: 10, padding: 14, color: '#d4d4d4', fontSize: 15, borderWidth: 1, borderColor: '#404040' },
  error: { color: '#ff5f57', fontSize: 12, marginTop: 10, backgroundColor: '#3a1d1d', padding: 10, borderRadius: 8 },
  connectBtn: { backgroundColor: '#007acc', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  connectBtnDisabled: { backgroundColor: '#3c3c3c' },
  connectBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { color: '#858585', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 },
  recentSection: { marginBottom: 30 },
  recentItem: { backgroundColor: '#252526', borderRadius: 8, padding: 12, marginBottom: 8 },
  recentUrl: { color: '#007acc', fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  helpSection: { backgroundColor: '#252526', borderRadius: 12, padding: 16 },
  helpTitle: { color: '#d4d4d4', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  helpText: { color: '#aaa', fontSize: 13, marginBottom: 5 },
});

export default ConnectScreen;
