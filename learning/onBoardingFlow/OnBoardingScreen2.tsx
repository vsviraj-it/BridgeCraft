import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import {
  SkipButton,
  OnBoardingImage,
  PaginationDots,
  NextButton,
  HowItWorksSection,
} from './components';

interface OnBoardingScreen2Props {
  navigation?: any;
}

const OnBoardingScreen2: React.FC<OnBoardingScreen2Props> = ({
  navigation,
}) => {
  const handleNext = () => {
    if (navigation) {
      navigation.navigate('OnBoarding3');
    }
  };

  const handleSkip = () => {
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SkipButton onPress={handleSkip} />

      <OnBoardingImage source={require('../assets/OnBoarding2.png')} />

      <PaginationDots totalDots={4} activeIndex={1} />

      <HowItWorksSection />

      <NextButton onPress={handleNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
});

export default OnBoardingScreen2;
