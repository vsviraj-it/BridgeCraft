import React from 'react';
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native';
import { fontSize, wp, hp } from '../utils/responsive';
import {
  SkipButton,
  OnBoardingImage,
  PaginationDots,
  NextButton,
} from './components';

interface OnBoardingScreen1Props {
  navigation?: any;
}

const OnBoardingScreen1: React.FC<OnBoardingScreen1Props> = ({
  navigation,
}) => {
  const handleNext = () => {
    if (navigation) {
      navigation.navigate('OnBoarding2');
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

      <OnBoardingImage source={require('../assets/OnBoarding1.png')} />

      <PaginationDots totalDots={4} activeIndex={0} />

      <Text style={styles.welcomeText}>Welcome to</Text>

      <Image style={styles.logoImg} source={require('../assets/Logo.png')} />

      <Text style={styles.description}>
        Your neighborhood's all‑in‑one home services app Delivered directly by
        our own in‑house crews
      </Text>

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
  logoImg: {
    width: wp(60),
    resizeMode: 'contain',
    marginTop: hp(-3),
  },
  welcomeText: {
    fontWeight: '600',
    fontSize: fontSize(16),
    textAlign: 'center',
    color: '#000000',
    marginTop: hp(5),
  },
  description: {
    fontSize: fontSize(13),
    textAlign: 'center',
    color: '##E6E6E',
    width: wp(75.6),
    paddingHorizontal: wp(5),
  },
});

export default OnBoardingScreen1;
