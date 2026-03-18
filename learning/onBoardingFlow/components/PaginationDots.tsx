import React from 'react';
import { View, StyleSheet } from 'react-native';
import { wp } from '../../utils/responsive';

interface PaginationDotsProps {
  totalDots: number;
  activeIndex: number;
}

const PaginationDots: React.FC<PaginationDotsProps> = ({
  totalDots,
  activeIndex,
}) => {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: totalDots }).map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === activeIndex && styles.activeDot]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(1),
  },
  dot: {
    width: wp(2.3),
    height: wp(2.3),
    borderRadius: wp(1.15),
    borderColor: '#343333ff',
    borderWidth: 1,
    opacity: 0.3,
  },
  activeDot: {
    backgroundColor: '#323131ff',
    borderRadius: wp(1.15),
  },
});

export default PaginationDots;
