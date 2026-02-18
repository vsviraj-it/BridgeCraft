import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedProps, useDerivedValue, withTiming } from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressBarProps {
  progress: number; // current progress (0-1)
  maxProgress: number; // max possible value
  radius: number;
  strokeWidth: number;
  backgroundColor: string;
  strokeColor: string;
  label: string;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  progress,
  maxProgress,
  radius,
  strokeWidth,
  backgroundColor,
  strokeColor,
  label,
}) => {
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useDerivedValue(() => {
    return withTiming(progress / maxProgress, { duration: 500 }); // Normalize to 0-1
  }, [progress, maxProgress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - animatedProgress.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={radius * 2} height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke={strokeColor}
          fill="none"
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${radius}, ${radius}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CircularProgressBar;
