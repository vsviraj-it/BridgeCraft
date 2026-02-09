import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { fontSize, wp, hp } from '../../utils/responsive';

interface SkipButtonProps {
  onPress: () => void;
}

const SkipButton: React.FC<SkipButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.skipButton} onPress={onPress}>
      <Text style={styles.skipText}>Skip</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  skipButton: {
    position: 'absolute',
    top: hp(6.9),
    right: wp(5),
    backgroundColor: 'rgba(3, 207, 146, 0.1)',
    borderRadius: wp(5.1),
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(3.8),
    zIndex: 10,
  },
  skipText: {
    fontWeight: '600',
    fontSize: fontSize(12),
    color: '#00B174',
    textAlign: 'right',
  },
});

export default SkipButton;
