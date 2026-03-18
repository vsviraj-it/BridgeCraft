import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

const NetworkDebuggerScreen = (props: any) => {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const config = {
    url: 'https://jsonplaceholder.typicode.com/posts',
    retries: 3,
  };

  useEffect(() => {
    console.log('Fetching data with config:', config);
    fetchData();
  }, [config]);

  function fetchData() {
    setLoading(true);
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
        console.log('Data loaded successfully');
      });
  }

  const RenderItem = ({ item }: any) => {
    return (
      <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
        <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
        <Text>{item.body}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 20,
            color: 'black',
          }}
        >
          Network Debugger
        </Text>

        <TouchableOpacity
          onPress={() => {
            setCount(count + 1);
            console.log('Count is now:', count);
          }}
          style={{
            backgroundColor: 'blue',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>
            Increment Count: {count}
          </Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : (
          <View>
            {data.slice(0, 5).map((item: any) => {
              return (
                <View>
                  <RenderItem item={item} />
                </View>
              );
            })}
          </View>
        )}

        <Text style={{ marginTop: 20, color: 'gray' }}>
          This is a debug screen. Do not use in production.
        </Text>
      </View>
    </ScrollView>
  );
};

export default NetworkDebuggerScreen;
