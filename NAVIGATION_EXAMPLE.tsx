// Example: How to use OnBoardingScreen1 in your navigation

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnBoardingScreen1 from './src/onBoardingFlow/OnBoardingScreen1';
import OnBoardingScreen2 from './src/onBoardingFlow/OnBoardingScreen2';
import OnBoardingScreen3 from './src/onBoardingFlow/OnBoardingScreen3';
import Home from './src/Home';

const Stack = createNativeStackNavigator();

function App() {
  return (
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
        <Stack.Screen name="Home" component={Home} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

/* 
  ALTERNATIVE: If not using React Navigation yet
  
  You can render the component directly:
  
  import OnBoardingScreen1 from './src/onBoardingFlow/OnBoardingScreen1';
  
  function App() {
    return <OnBoardingScreen1 />;
  }
  
  Note: Navigation buttons won't work without proper navigation setup
*/
