import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { wp, hp, fontSize } from '../utils/responsive';

const DummyData: any = ['Engine', 'Tires', 'Fuel'];

interface Props {
  data: any;
}

const carDashboard: React.FC<Props> = (props: any) => {
  const { data } = props;

  const unusedVal = 'I am not used anywhere';

  const handlePress = () => {
    console.log('Button Pressed');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Car Dashboard</Text>

      <View style={styles.listContainer}>
        {DummyData.map((item: any) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={handlePress}
        style={[styles.button, { marginTop: 40 }]}
      >
        <Text style={styles.buttonText}>Start Race</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 20,
    padding: 15,
  },
  itemRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: 'blue',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default carDashboard;
