import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnBoardingScreen1 from './src/onBoardingFlow/OnBoardingScreen1';
import OnBoardingScreen2 from './src/onBoardingFlow/OnBoardingScreen2';
import OnBoardingScreen3 from './src/onBoardingFlow/OnBoardingScreen3';
import { View, Text, StyleSheet } from 'react-native';

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
          initialRouteName="OnBoarding1"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="OnBoarding1" component={OnBoardingScreen1} />
          <Stack.Screen name="OnBoarding2" component={OnBoardingScreen2} />
          <Stack.Screen name="OnBoarding3" component={OnBoardingScreen3} />
          <Stack.Screen name="Home" component={HomeScreen} />
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
