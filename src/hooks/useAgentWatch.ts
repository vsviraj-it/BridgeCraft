import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentStatus, FileNode, ChatMessage } from '../types/agentWatch';

export const useAgentWatch = (bridgeUrl: string) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [connected, setConnected] = useState(false);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('disconnected');
  const [workspacePath, setWorkspacePath] = useState('');
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [fileChanges, setFileChanges] = useState<
    { path: string; content?: string; timestamp: number; isAgent?: boolean }[]
  >([]);
  
  // Track agent status for file filtering
  const agentStatusRef = useRef<AgentStatus>('disconnected');
  useEffect(() => { agentStatusRef.current = agentStatus; }, [agentStatus]);

  // Callback registered by screen to update editor
  const onFileContent = useRef<
    ((path: string, content: string, language?: string) => void) | null
  >(null);

  const sendWS = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(bridgeUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setAgentStatus('idle');
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        handleMessage(data);
      } catch (err) {
        console.error('[WS] Parse error', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setAgentStatus('disconnected');
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      reconnectTimer.current = setTimeout(connectWS, 3000);
    };

    ws.onerror = () => ws.close();
  }, [bridgeUrl]);

  const handleMessage = (data: any) => {
    switch (data.type) {
      case 'init':
        setAgentStatus(data.agentStatus || 'idle');
        if (data.fileTree) setFileTree(data.fileTree);
        if (data.workspacePath) setWorkspacePath(data.workspacePath);
        if (data.promptHistory) setChatHistory(data.promptHistory);
        if (data.fileChanges) setFileChanges(data.fileChanges);
        break;

      case 'file_tree':
        setFileTree(data.tree || []);
        if (data.workspacePath) setWorkspacePath(data.workspacePath);
        break;

      case 'agent_status':
        setAgentStatus(data.status || 'idle');
        setChatHistory(prev => {
          const newHistory = [...prev];

          // Add technical status for tracking
          newHistory.push({
            type:
              data.status === 'running'
                ? 'prompt_start'
                : `prompt_${data.status}`,
            prompt: data.prompt,
            result: data.result,
            error: data.error,
            timestamp: Date.now(),
          });

          // Also add a user-friendly chat bubble if completed
          if (data.status === 'complete' || data.status === 'done') {
            newHistory.push({
              type: 'chat_message',
              role: 'system',
              content: `✅ Task completed: ${data.result || 'Success'}`,
              timestamp: Date.now(),
            });
          } else if (data.status === 'error') {
            newHistory.push({
              type: 'chat_message',
              role: 'system',
              content: `❌ Task failed: ${data.error || 'Unknown error'}`,
              timestamp: Date.now(),
            });
          }

          return newHistory;
        });
        break;

      case 'chat_message':
        setChatHistory(prev => [
          ...prev,
          {
            type: 'chat_message',
            role: data.role,
            content: data.content,
            timestamp: data.timestamp || Date.now(),
          },
        ]);
        break;

      case 'file_update':
      case 'file_changed':
        // 1. Always filter out the internal IDE log
        if (data.path && data.path.includes('.agent_prompts.log')) {
          break;
        }

        // 2. Decide if this is an "Agent Change" or just a manual save
        // file_update is explicitly sent by agent-tool. 
        // file_changed is from file-watcher (include if agent is 'running')
        const isAgentChange = data.type === 'file_update' || agentStatusRef.current === 'running';

        if (isAgentChange) {
          setFileChanges(prev => [
            ...prev,
            {
              path: data.path,
              content: data.content,
              timestamp: data.timestamp || Date.now(),
              isAgent: true,
            },
          ]);
        }
        
        // 3. Always update the editor content regardless of source
        if (onFileContent.current) {
          onFileContent.current(data.path, data.content, data.language);
        }
        break;

      case 'file_content':
        if (onFileContent.current) {
          onFileContent.current(data.path, data.content, data.language);
        }
        break;

      case 'file_deleted':
        setFileChanges(prev => [
          ...prev,
          {
            path: `[deleted] ${data.path}`,
            timestamp: data.timestamp || Date.now(),
          },
        ]);
        break;

      case 'prompt_queued':
        setChatHistory(prev => {
          // Check if we already have this message to avoid duplicates
          if (
            prev.some(
              m =>
                m.content === data.prompt &&
                m.role === 'user' &&
                Date.now() - m.timestamp < 2000,
            )
          ) {
            return prev;
          }
          return [
            ...prev,
            {
              type: 'chat_message',
              role: 'user',
              content: data.prompt,
              timestamp: Date.now(),
            },
          ];
        });
        break;

      case 'cancel_requested':
        setChatHistory(prev => [
          ...prev,
          {
            type: 'system',
            content: 'Cancel requested',
            timestamp: Date.now(),
          },
        ]);
        break;
    }
  };

  useEffect(() => {
    connectWS();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connectWS]);

  return {
    connected,
    agentStatus,
    workspacePath,
    fileTree,
    chatHistory,
    fileChanges,
    sendWS,
    registerOnFileContent: (cb: (p: string, c: string, l?: string) => void) => {
      onFileContent.current = cb;
    },
  };
};
