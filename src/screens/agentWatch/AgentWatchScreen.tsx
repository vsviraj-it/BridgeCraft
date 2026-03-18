import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { WebView } from 'react-native-webview';
import { useAgentWatch } from '../../hooks/useAgentWatch';
import { CodeViewerProps, ActivePanel, FileNode } from '../../types/agentWatch';
import {
  SIDEBAR_WIDTH,
  getFileIconColor,
  getFileIcon,
  formatTime,
  countFiles,
} from '../../utils/agentWatch';
import { wp, hp, fontSize } from '../../utils/responsive';
import FileTreeItem from '../../components/agentWatch/FileTreeItem';

const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const MONACO_HTML = Platform.select({
  ios: require('../../assets/web/monaco.html'),
  android: { uri: 'file:///android_asset/monaco.html' }
});

const AgentWatchScreen: React.FC<CodeViewerProps> = ({ bridgeUrl, onDisconnect }) => {
  const {
    connected,
    agentStatus,
    workspacePath,
    fileTree,
    chatHistory,
    fileChanges,
    sendWS,
    registerOnFileContent,
  } = useAgentWatch(bridgeUrl);


  const webViewRef = useRef<WebView>(null);
  const [editorReady, setEditorReady] = useState(false);
  const pendingMessages = useRef<string[]>([]);

  const [activeFilePath, setActiveFilePath] = useState('');
  const [activeFileContent, setActiveFileContent] = useState('');
  const [activeFileLanguage, setActiveFileLanguage] = useState('');
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activePanel, setActivePanel] = useState<ActivePanel>('editor');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [promptText, setPromptText] = useState('');
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const chatScrollRef = useRef<FlatList>(null);

  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const notificationAnim = useRef(new Animated.Value(-100)).current;

  // Auto-scroll chat
  useEffect(() => {
    if (chatHistory.length > 0 && activePanel === 'chat') {
      setTimeout(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [chatHistory, activePanel]);

  // Handle Notifications and Haptics
  useEffect(() => {
    if (agentStatus === 'complete' || agentStatus === 'done') {
      const lastMsg = chatHistory[chatHistory.length - 1];
      const resultText = lastMsg?.result || lastMsg?.content?.replace('✅ Task completed:', '').trim() || 'Success';
      ReactNativeHapticFeedback.trigger('notificationSuccess', HAPTIC_OPTIONS);
      showBanner(`✅ Task completed: ${resultText}`, 'success');
    } else if (agentStatus === 'error') {
      const lastMsg = chatHistory[chatHistory.length - 1];
      const errorText = lastMsg?.error || lastMsg?.content?.replace('❌ Task failed:', '').trim() || 'Unknown error';
      ReactNativeHapticFeedback.trigger('notificationError', HAPTIC_OPTIONS);
      showBanner(`❌ Task failed: ${errorText}`, 'error');
    } else if (agentStatus === 'running') {
      ReactNativeHapticFeedback.trigger('impactLight', HAPTIC_OPTIONS);
    }
  }, [agentStatus]);

  const showBanner = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    Animated.sequence([
      Animated.timing(notificationAnim, { toValue: 20, duration: 400, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(notificationAnim, { toValue: -100, duration: 400, useNativeDriver: true }),
    ]).start(() => setNotification(null));
  };

  const sendToEditor = useCallback((msg: object) => {
    const json = JSON.stringify(msg);
    if (webViewRef.current && editorReady) {
      webViewRef.current.postMessage(json);
    } else {
      pendingMessages.current.push(json);
    }
  }, [editorReady]);

  const activeFileRef = useRef(activeFilePath);
  useEffect(() => { activeFileRef.current = activeFilePath; }, [activeFilePath]);

  useEffect(() => {
    registerOnFileContent((path, content, language) => {
      if (path === activeFileRef.current) {
        if (language) {
          setActiveFileLanguage(language);
          sendToEditor({ type: 'set_language', language });
        }
        setActiveFileContent(content);
        sendToEditor({ type: 'set_code', code: content });
      }
    });
  }, [registerOnFileContent, sendToEditor]);

  const openFile = useCallback((filePath: string) => {
    setActiveFilePath(filePath);
    setOpenTabs(prev => prev.includes(filePath) ? prev : [...prev, filePath]);
    setActivePanel('editor');
    sendWS({ type: 'request_file', path: filePath });
    closeSidebar();
  }, [sendWS]);

  const closeFile = useCallback((filePath: string) => {
    setOpenTabs(prev => {
      const next = prev.filter(p => p !== filePath);
      if (activeFilePath === filePath) {
        if (next.length > 0) {
          const lastIdx = prev.indexOf(filePath);
          const switchPath = next[Math.max(0, lastIdx - 1)];
          openFile(switchPath);
        } else {
          setActiveFilePath('');
          setActiveFileContent('');
          setActiveFileLanguage('');
          sendToEditor({ type: 'set_code', code: '' });
        }
      }
      return next;
    });
  }, [activeFilePath, openFile, sendToEditor]);

  const toggleSidebar = useCallback(() => {
    Animated.timing(sidebarAnim, {
      toValue: sidebarOpen ? -SIDEBAR_WIDTH : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, sidebarAnim]);

  const closeSidebar = useCallback(() => {
    if (sidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
      setSidebarOpen(false);
    }
  }, [sidebarOpen, sidebarAnim]);

  const statusColor = agentStatus === 'running' ? '#f7df1e' : agentStatus === 'error' ? '#ff5f57' : agentStatus === 'idle' ? '#28c840' : '#858585';
  const statusLabel = agentStatus === 'running' ? 'Agent Running' : agentStatus === 'error' ? 'Error' : agentStatus === 'idle' ? 'Ready' : 'Disconnected';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#1e1e1e" />

      {notification && (
        <Animated.View style={[styles.notificationBanner, { transform: [{ translateY: notificationAnim }], backgroundColor: notification.type === 'success' ? '#28c840' : '#ff5f57' }]}>
          <Text style={styles.notificationText}>{notification.msg}</Text>
        </Animated.View>
      )}

      <View style={styles.titleBar}>
        <View style={styles.titleLeft}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.menuBtn}>
            <Text style={styles.menuIcon}>{sidebarOpen ? '✕' : '☰'}</Text>
          </TouchableOpacity>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.titleText} numberOfLines={1}>{statusLabel}</Text>
        </View>
        <View style={styles.titleRight}>
          {connected && <View style={styles.connBadge}><Text style={styles.connBadgeText}>LIVE</Text></View>}
          {fileTree.length > 0 && <View style={styles.fileBadge}><Text style={styles.fileBadgeText}>{countFiles(fileTree)} files</Text></View>}
        </View>
      </View>

      <View style={styles.panelBar}>
        {(['editor', 'chat', 'changes'] as ActivePanel[]).map(panel => (
          <TouchableOpacity key={panel} style={[styles.panelTab, activePanel === panel && styles.panelTabActive]} onPress={() => setActivePanel(panel)}>
            <Text style={[styles.panelTabText, activePanel === panel && styles.panelTabTextActive]}>
              {panel === 'editor' ? '< > Editor' : panel === 'chat' ? '💬 Chat' : '📝 Changes'}
            </Text>
            {panel === 'chat' && agentStatus === 'running' && <View style={styles.runningDot} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1, display: activePanel === 'editor' ? 'flex' : 'none' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
          {openTabs.map(p => {
            const name = p.split('/').pop() || '';
            const isActive = p === activeFilePath;
            return (
              <View key={p} style={[styles.tab, isActive && styles.activeTab]}>
                <TouchableOpacity style={styles.tabClickArea} onPress={() => openFile(p)}>
                  <Text style={[styles.tabIcon, { color: getFileIconColor(name) }]}>{getFileIcon(name)}</Text>
                  <Text style={[styles.tabText, isActive && styles.activeTabText]} numberOfLines={1}>{name}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => closeFile(p)}>
                  <Text style={styles.closeBtnText}>×</Text>
                </TouchableOpacity>
                {isActive && <View style={styles.activeIndicator} />}
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.breadcrumb}><Text style={styles.breadcrumbText}>{activeFilePath || 'Select a file'}</Text></View>
        <WebView
          ref={webViewRef}
          source={MONACO_HTML}
          onMessage={(e) => {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.type === 'editor_ready') {
              setEditorReady(true);
              if (activeFileRef.current && activeFileContent) {
                webViewRef.current?.postMessage(JSON.stringify({ type: 'set_language', language: activeFileLanguage || 'plaintext' }));
                webViewRef.current?.postMessage(JSON.stringify({ type: 'set_code', code: activeFileContent }));
              }
              pendingMessages.current.forEach(msg => webViewRef.current?.postMessage(msg));
              pendingMessages.current = [];
            }
          }}
          javaScriptEnabled domStorageEnabled
        />
      </View>

      <View style={{ flex: 1, display: activePanel === 'changes' ? 'flex' : 'none' }}>
        <FlatList
          data={[...fileChanges].reverse()}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.changeCard} onPress={() => openFile(item.path)}>
              <View style={styles.changeHeader}>
                <Text style={styles.changeIcon}>📝</Text>
                <Text style={styles.changePath} numberOfLines={1}>{item.path}</Text>
              </View>
              {item.content && (
                <View style={styles.codePreview}>
                  <Text style={styles.codePreviewText} numberOfLines={6}>
                    {item.content.trim()}
                  </Text>
                </View>
              )}
              <View style={styles.changeDetails}>
                <Text style={styles.changeType}>⚡ Modified</Text>
                <Text style={styles.changeTime}>{formatTime(item.timestamp)}</Text>
              </View>
              <Text style={styles.clickToView}>Tap to view full code →</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent changes detected</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 15 }}
        />
      </View>

      <View style={{ flex: 1, display: activePanel === 'chat' ? 'flex' : 'none' }}>
        <FlatList
          ref={chatScrollRef}
          data={chatHistory}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => {
            const isSystem = item.role === 'system' || item.type?.startsWith('prompt_complete');
            return (
              <View style={[
                styles.chatBubble,
                item.role === 'user' ? styles.chatBubbleUser :
                  isSystem ? styles.chatBubbleSystem :
                    styles.chatBubbleAssistant
              ]}>
                {isSystem && <Text style={styles.systemIcon}>🤖</Text>}
                <Text style={[styles.chatContent, isSystem && styles.chatContentSystem]}>
                  {item.content || (item.result ? `✅ Done: ${item.result}` : '') || (item.error ? `❌ Error: ${item.error}` : '')}
                </Text>
                <Text style={styles.chatTime}>{formatTime(item.timestamp)}</Text>
              </View>
            );
          }}
          ListFooterComponent={() => (
            <View style={styles.chatFooter}>
              {agentStatus === 'running' ? (
                <View style={styles.typingContainer}>
                  <View style={styles.typingDot} /><View style={styles.typingDot} /><View style={styles.typingDot} />
                  <Text style={styles.typingText}>Agent is thinking...</Text>
                </View>
              ) : (
                <Text style={styles.footerStatus}>Last sync: {formatTime(Date.now())}</Text>
              )}
            </View>
          )}
          contentContainerStyle={{ padding: 10, paddingBottom: 50 }}
        />
        <View style={styles.promptBar}>
          <TextInput style={styles.promptInput} value={promptText} onChangeText={setPromptText} placeholder="Type a message..." placeholderTextColor="#888" />
          <TouchableOpacity style={styles.sendBtn} onPress={() => { sendWS({ type: 'send_prompt', prompt: promptText }); setPromptText(''); }}>
            <Text style={styles.sendBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {sidebarOpen && <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeSidebar} />}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <ScrollView style={{ flex: 1 }}>
          {fileTree.map(node => (
            <FileTreeItem key={node.path} node={node} depth={0} expanded={expandedFolders} onToggle={(p) => setExpandedFolders(prev => { const n = new Set(prev); n.has(p) ? n.delete(p) : n.add(p); return n; })} onOpen={openFile} activePath={activeFilePath} />
          ))}
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  titleBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#323233', paddingHorizontal: 12, paddingVertical: 10 },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuBtn: { padding: 4 },
  menuIcon: { color: '#ccc', fontSize: 20 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  titleText: { color: '#ccc', fontSize: 14, fontWeight: '600' },
  titleRight: { flexDirection: 'row', gap: 10 },
  connBadge: { backgroundColor: '#28c840', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  connBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  fileBadge: { backgroundColor: '#3c3c3c', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  fileBadgeText: { color: '#aaa', fontSize: 10 },
  panelBar: { flexDirection: 'row', backgroundColor: '#252526', borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  panelTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  panelTabActive: { borderBottomColor: '#007acc' },
  panelTabText: { color: '#888', fontSize: 12 },
  panelTabTextActive: { color: '#fff' },
  runningDot: { position: 'absolute', top: 8, right: 10, width: 6, height: 6, borderRadius: 3, backgroundColor: '#f7df1e' },
  tabBar: { backgroundColor: '#252526', maxHeight: 40 },
  tab: { flexDirection: 'row', alignItems: 'center', minWidth: 100, borderRightWidth: 1, borderRightColor: '#1e1e1e' },
  tabClickArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, gap: 8, flexGrow: 1 },
  activeTab: { backgroundColor: '#1e1e1e' },
  tabIcon: { fontSize: 10, fontWeight: '700' },
  tabText: { color: '#888', fontSize: 12 },
  activeTabText: { color: '#fff' },
  activeIndicator: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, backgroundColor: '#007acc' },
  closeBtn: { paddingHorizontal: 10, paddingVertical: 10 },
  closeBtnText: { color: '#888', fontSize: 14 },
  breadcrumb: { backgroundColor: '#1e1e1e', paddingHorizontal: 15, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#2d2d2d' },
  breadcrumbText: { color: '#888', fontSize: 11 },
  chatBubble: { padding: 12, borderRadius: 10, marginVertical: 4, maxWidth: '80%' },
  chatBubbleUser: { backgroundColor: '#264f78', alignSelf: 'flex-end' },
  chatBubbleAssistant: { backgroundColor: '#2d2d2d', alignSelf: 'flex-start' },
  chatContent: { color: '#eee', fontSize: fontSize(13), lineHeight: 18 },
  chatContentSystem: { color: '#28c840', fontWeight: '700', fontSize: fontSize(11) },
  chatTime: { color: '#666', fontSize: fontSize(9), marginTop: 2, alignSelf: 'flex-end' },
  systemIcon: { fontSize: fontSize(14), marginBottom: 2 },
  chatBubbleSystem: {
    backgroundColor: 'rgba(40, 200, 64, 0.05)',
    borderColor: 'rgba(40, 200, 64, 0.4)',
    borderWidth: 1,
    alignSelf: 'center',
    width: '92%',
    padding: 10,
    marginVertical: 8,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  chatFooter: { padding: 10, alignItems: 'center', marginBottom: 20 },
  footerStatus: { color: '#444', fontSize: fontSize(9), textTransform: 'uppercase', letterSpacing: 1.5 },
  emptyContainer: { flex: 1, height: 300, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666', fontSize: fontSize(13) },
  changeCard: {
    backgroundColor: '#252526',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  changeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  changeIcon: { fontSize: 16 },
  changePath: { color: '#ccc', fontSize: fontSize(12), fontWeight: '600', flex: 1 },
  changeDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  changeType: { color: '#f7df1e', fontSize: fontSize(10), fontWeight: '700', textTransform: 'uppercase' },
  changeTime: { color: '#666', fontSize: fontSize(10) },
  codePreview: {
    backgroundColor: '#1a1a1b',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#2d2d2d',
    maxHeight: 120,
  },
  codePreviewText: {
    color: '#8ac926',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: fontSize(9),
    lineHeight: 14,
  },
  clickToView: { color: '#007acc', fontSize: fontSize(10), marginTop: 10, fontStyle: 'italic', fontWeight: '600' },
  typingContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  typingDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#f7df1e' },
  typingText: { color: '#f7df1e', fontSize: 11, fontStyle: 'italic', marginLeft: 5 },
  notificationBanner: {
    position: 'absolute',
    top: hp(7),
    left: wp(5),
    right: wp(5),
    padding: hp(2),
    borderRadius: 12,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: { color: '#fff', fontSize: fontSize(12), fontWeight: '700', textAlign: 'center' },
  promptBar: { flexDirection: 'row', padding: 10, gap: 10, backgroundColor: '#252526' },
  promptInput: { flex: 1, backgroundColor: '#3c3c3c', borderRadius: 8, paddingHorizontal: 15, color: '#fff' },
  sendBtn: { backgroundColor: '#007acc', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: 20 },
  sidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_WIDTH, backgroundColor: '#252526', zIndex: 100, paddingVertical: 20 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90 },
});

export default AgentWatchScreen;
