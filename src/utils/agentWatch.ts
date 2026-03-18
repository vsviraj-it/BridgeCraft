import { Dimensions, Platform } from 'react-native';
import { FileNode } from '../types/agentWatch';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.75;

export const FILE_ICON_COLORS: Record<string, string> = {
  tsx: '#007acc',
  ts: '#007acc',
  js: '#f7df1e',
  jsx: '#61dafb',
  css: '#1572b6',
  py: '#3776ab',
  json: '#f5a623',
  html: '#e34c26',
  md: '#858585',
  env: '#ecd53f',
  yml: '#cb171e',
  yaml: '#cb171e',
  sh: '#89e051',
  go: '#00add8',
  rs: '#dea584',
  java: '#b07219',
  kt: '#a97bff',
  swift: '#f05138',
  rb: '#cc342d',
  sql: '#e38c00',
};

export const getFileIconColor = (name: string) =>
  FILE_ICON_COLORS[name.split('.').pop() || ''] || '#858585';

export const getFileIcon = (name: string) => {
  const ext = name.split('.').pop() || '';
  const map: Record<string, string> = {
    tsx: 'TS',
    ts: 'TS',
    js: 'JS',
    jsx: 'JX',
    css: 'CS',
    py: 'PY',
    json: '{}',
    html: '<>',
    md: '#',
    env: '**',
    yml: 'YM',
    yaml: 'YM',
    sh: '$',
    go: 'GO',
    rs: 'RS',
    java: 'JV',
    kt: 'KT',
    swift: 'SW',
    lock: 'LK',
  };
  return map[ext] || '  ';
};

export const FOLDER_COLORS: Record<string, string> = {
  src: '#42a5f5',
  components: '#ab47bc',
  screens: '#66bb6a',
  hooks: '#ff7043',
  services: '#26c6da',
  utils: '#ffca28',
  server: '#ef5350',
  'mcp-server': '#7e57c2',
  tools: '#8d6e63',
  assets: '#78909c',
  ios: '#a0a0a0',
  android: '#a4c639',
  __tests__: '#66bb6a',
  types: '#4ec9b0',
};

export const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const countFiles = (nodes: FileNode[]): number =>
  nodes.reduce(
    (s, n) => s + (n.type === 'file' ? 1 : countFiles(n.children || [])),
    0,
  );
