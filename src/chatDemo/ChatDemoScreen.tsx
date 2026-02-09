import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import io from 'socket.io-client';

const socket = io('http://192.168.41.210:3000');

type ChatMessage = {
  user?: string;
  text: string;
  time?: string;
  system?: boolean;
};

const ChatDemoScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);

  const joinChat = () => {
    if (!username) return;
    socket.emit('join', username);
    setJoined(true);
  };

  useEffect(() => {
    socket.on('message', msg => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('system', text => {
      setMessages(prev => [...prev, { system: true, text }]);
    });

    return () => {
      socket.off('message');
      socket.off('system');
    };
  }, []);

  const sendMessage = () => {
    if (!message) return;
    socket.emit('message', {
      text: message,
    });
    setMessage('');
  };

  if (!joined) {
    return (
      <View style={{ padding: 20, paddingTop: 100 }}>
        <TextInput
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          style={{ borderWidth: 1 }}
        />
        <Button title="Join Chat" onPress={joinChat} />
      </View>
    );
  }

  return (
    <View style={{ padding: 20, paddingTop: 100 }}>
      <FlatList
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) =>
          item.system ? (
            <Text style={{ color: 'gray', fontSize: 12 }}>{item.text}</Text>
          ) : (
            <Text>
              <Text style={{ fontWeight: 'bold' }}>{item.user}: </Text>
              {item.text}
            </Text>
          )
        }
      />

      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type message..."
        style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
      />

      <Button title="Send" onPress={sendMessage} />
    </View>
  );
};

export default ChatDemoScreen;
