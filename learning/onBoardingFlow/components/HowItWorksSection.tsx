import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { fontSize, wp, hp } from '../../utils/responsive';

const HowItWorksSection: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>How It Works</Text>

      <View style={styles.stepsContainer}>
        {/* Step 1 */}
        <View style={styles.stepItem}>
          <Image
            source={require('../../assets/LocationIcon.png')}
            style={styles.stepIcon}
          />
          <Text style={styles.stepText}>Confirm your address</Text>
        </View>

        {/* Step 2 */}
        <View style={styles.stepItem}>
          <Image
            source={require('../../assets/ServiceIcon.png')}
            style={styles.stepIcon}
          />
          <Text style={styles.stepText}>Select a one-time service or plan</Text>
        </View>

        {/* Step 3 */}
        <View style={styles.stepItem}>
          <Image
            source={require('../../assets/CheckIcon.png')}
            style={styles.stepIcon}
          />
          <Text style={styles.stepText}>Book in seconds</Text>
        </View>

        {/* Step 4 */}
        <View style={styles.stepItem}>
          <Image
            source={require('../../assets/DeliveryIcon.png')}
            style={styles.stepIcon}
          />
          <Text style={styles.stepText}>We deliver the service</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: '700',
    fontSize: fontSize(20),
    lineHeight: fontSize(24),
    color: '#000000',
    marginTop: hp(5.4),
    alignSelf: 'flex-start',
    marginLeft: wp(9.4),
  },
  stepsContainer: {
    marginTop: hp(1.8),
    width: wp(81),
    alignSelf: 'flex-start',
    marginLeft: wp(9.4),
    gap: hp(1.8),
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: hp(2.3),
  },
  stepIcon: {
    width: wp(4.1),
    height: wp(4.1),
    marginRight: wp(1.8),
    resizeMode: 'contain',
  },
  stepText: {
    fontWeight: '500',
    fontSize: fontSize(14),
    lineHeight: fontSize(20),
    color: '#505050',
    flex: 1,
  },
});

export default HowItWorksSection;
