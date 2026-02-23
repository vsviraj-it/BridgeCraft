import React from 'react';
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native';
import { fontSize, wp, hp } from '../utils/responsive';
import {
  SkipButton,
  OnBoardingImage,
  PaginationDots,
  NextButton,
} from './components';

interface OnBoardingScreen3Props {
  navigation?: any;
}

const OnBoardingScreen3: React.FC<OnBoardingScreen3Props> = ({
  navigation,
}) => {
  const handleNext = () => {
    if (navigation) {
      navigation.navigate('OnBoarding4');
    }
  };

  const handleSkip = () => {
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  const benefits = [
    'Trusted in-house crews',
    'One app for everyday home needs',
    'No long‑term contracts',
    'Pause or cancel as needed',
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <SkipButton onPress={handleSkip} />

      <OnBoardingImage source={require('../assets/OnBoarding3.png')} />

      <PaginationDots totalDots={4} activeIndex={2} />

      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>Why Neighbors Love Us</Text>

        <View style={styles.listContainer}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Image
                source={require('../assets/tick-circle.png')}
                style={styles.tickIcon}
              />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.retentionContainer}>
          <Text style={styles.retentionText}>97% </Text>
          <Text style={styles.retentionValue}>customer retention</Text>
        </View>
      </View>

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
  contentContainer: {
    width: '100%',
    paddingLeft: wp(8.4),
    marginTop: hp(3),
  },
  titleText: {
    fontWeight: '700',
    fontSize: fontSize(20),
    lineHeight: fontSize(24),
    color: '#000000',
    marginBottom: hp(2.3),
  },
  listContainer: {
    gap: hp(1.5),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickIcon: {
    width: wp(5.1),
    height: wp(5.1),
    marginRight: wp(2),
    resizeMode: 'contain',
  },
  benefitText: {
    fontWeight: '500',
    fontSize: fontSize(14),
    lineHeight: fontSize(20),
    color: '#505050',
  },
  retentionText: {
    fontSize: fontSize(18),
    color: '#000000',
  },
  retentionValue: {
    fontSize: fontSize(14),
    color: '#505050',
  },
  retentionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: hp(4),
    gap: hp(0.2),
  },
});

export default OnBoardingScreen3;
