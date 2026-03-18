export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
}

export interface ChatMessage {
  type: string;
  role?: string;
  content?: string;
  prompt?: string;
  result?: string;
  error?: string;
  timestamp: number;
}

export type AgentStatus = 'idle' | 'running' | 'error' | 'disconnected' | 'complete' | 'done';
export type ActivePanel = 'editor' | 'chat' | 'changes';

export interface CodeViewerProps {
  bridgeUrl: string;
  onDisconnect: () => void;
}
