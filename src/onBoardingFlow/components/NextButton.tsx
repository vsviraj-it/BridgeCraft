import React from 'react';
import { TouchableOpacity, Text, Image, View, StyleSheet } from 'react-native';
import { fontSize, wp, hp } from '../../utils/responsive';

interface NextButtonProps {
  onPress: () => void;
  text?: string;
}

const NextButton: React.FC<NextButtonProps> = ({ onPress, text = 'Next' }) => {
  return (
    <TouchableOpacity style={styles.nextButton} onPress={onPress}>
      <View />
      <Text style={styles.nextText}>{text}</Text>
      <Image
        source={require('../../assets/arrow-left.png')}
        style={styles.arrowIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nextButton: {
    bottom: hp(5),
    position: 'absolute',
    width: wp(86.5),
    height: hp(5.9),
    backgroundColor: '#03CF92',
    borderRadius: wp(10.2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
  },
  nextText: {
    fontWeight: '600',
    fontSize: fontSize(16),
    lineHeight: fontSize(20),
    textAlign: 'center',
    color: '#FFFFFF',
  },
  arrowIcon: {
    width: wp(6.1),
    height: wp(6.1),
  },
});

export default NextButton;
