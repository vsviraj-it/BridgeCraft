import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { FileNode } from '../../types/agentWatch';
import { FOLDER_COLORS, getFileIconColor, getFileIcon } from '../../utils/agentWatch';

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (p: string) => void;
  onOpen: (p: string) => void;
  activePath: string;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node, depth, expanded, onToggle, onOpen, activePath,
}) => {
  const isFolder = node.type === 'folder';
  const isOpen = expanded.has(node.path);
  const isActive = node.path === activePath;

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.item,
          { paddingLeft: 12 + depth * 16 },
          isActive && styles.activeItem,
        ]}
        onPress={() => (isFolder ? onToggle(node.path) : onOpen(node.path))}
        activeOpacity={0.6}>
        {isFolder ? (
          <Text style={styles.chevron}>{isOpen ? '▾' : '▸'}</Text>
        ) : (
          <View style={{ width: 14 }} />
        )}
        {isFolder ? (
          <Text
            style={[
              styles.folderIcon,
              { color: FOLDER_COLORS[node.name] || '#e8a86e' },
            ]}>
            {isOpen ? '▤' : '▧'}
          </Text>
        ) : (
          <Text
            style={[styles.fileLabel, { color: getFileIconColor(node.name) }]}>
            {getFileIcon(node.name)}
          </Text>
        )}
        <Text
          style={[
            styles.name,
            isFolder && styles.folderName,
            isActive && styles.activeName,
          ]}
          numberOfLines={1}>
          {node.name}
        </Text>
      </TouchableOpacity>
      {isFolder &&
        isOpen &&
        node.children?.map(c => (
          <FileTreeItem
            key={c.path}
            node={c}
            depth={depth + 1}
            expanded={expanded}
            onToggle={onToggle}
            onOpen={onOpen}
            activePath={activePath}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 4, paddingRight: 12, gap: 6,
  },
  activeItem: { backgroundColor: '#37373d' },
  chevron: { color: '#858585', fontSize: 10, width: 14, textAlign: 'center' },
  folderIcon: { fontSize: 14, width: 18, textAlign: 'center' },
  fileLabel: {
    fontSize: 9, fontWeight: '700', width: 18, textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  name: { color: '#cccccc', fontSize: 13, flex: 1 },
  folderName: { fontWeight: '500' },
  activeName: { color: '#ffffff' },
});

export default FileTreeItem;
