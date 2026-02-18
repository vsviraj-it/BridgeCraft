import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnBoardingScreen1 from './src/onBoardingFlow/OnBoardingScreen1';
import OnBoardingScreen2 from './src/onBoardingFlow/OnBoardingScreen2';
import OnBoardingScreen3 from './src/onBoardingFlow/OnBoardingScreen3';
import { View, Text, StyleSheet } from 'react-native';
import Home from './src/Home';
import NetworkHistoryScreen from './src/screens/NetworkHistoryScreen';

const Stack = createNativeStackNavigator();

// Placeholder Home Screen
const HomeScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>Welcome Home!</Text>
  </View>
);

const App = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="NetworkHistory" component={NetworkHistoryScreen} options={{ headerShown: true, title: 'Network History' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#03CF92',
  },
});

export default App;
 