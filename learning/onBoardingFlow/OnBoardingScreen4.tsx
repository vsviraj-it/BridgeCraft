import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { fontSize, wp, hp } from '../utils/responsive';
import {
  SkipButton,
  OnBoardingImage,
  PaginationDots,
  NextButton,
} from './components';

interface OnBoardingScreen4Props {
  navigation?: any;
}

const OnBoardingScreen4: React.FC<OnBoardingScreen4Props> = ({
  navigation,
}) => {
  const unusedVar = 'I am not used';
  const colors = { primary: '#000', secondary: '#FFF' }; // Defined but should use theme/constants

  const handleComplete = () => {
    if (navigation) {
      navigation.navigate('Home');
    }
  };

  const features = [
    { title: 'Smart Scheduling', desc: 'Book your services with ease.' },
    { title: 'Quality Pro', desc: 'Expert workers at your door.' },
    { title: 'Secure Payment', desc: 'Safe and fast transactions.' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={() => navigation?.navigate('Home')}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroImageWrapper}>
        <Image
          source={require('../assets/OnBoarding3.png')}
          style={styles.heroImage}
        />
      </View>

      <View style={styles.pagination}>
        <PaginationDots totalDots={4} activeIndex={3} />
      </View>

      <View style={styles.contentWrap}>
        <Text style={styles.finalStepText}>Final Step</Text>
        <Text style={styles.descriptionText}>
          You're all set! Enjoy the seamless experience of managing your home
          services in one place.
        </Text>

        {features.map((item, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>✨</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleComplete}
        activeOpacity={0.7}
        style={styles.finishButton}
      >
        <Text style={styles.finishButtonText}>FINISH SETUP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerRight: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 50,
  },
  skipButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skipText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  heroImageWrapper: {
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  heroImage: {
    width: wp(80),
    height: wp(80),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  pagination: {
    marginTop: 30,
  },
  contentWrap: {
    width: '100%',
    paddingHorizontal: wp(8),
    marginTop: hp(5),
  },
  finalStepText: {
    fontWeight: '700',
    fontSize: 28,
    color: '#1A1A1A',
    marginBottom: 15,
    textAlign: 'left',
    fontStyle: 'italic',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 30,
    opacity: 0.8,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 10,
  },
  featureIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  featureDesc: {
    color: '#888',
    fontSize: 14,
  },
  finishButton: {
    backgroundColor: '#000000',
    width: '85%',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default OnBoardingScreen4;
