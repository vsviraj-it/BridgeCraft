import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface StepIconProps {
  type: 'location' | 'service' | 'check' | 'delivery';
}

const StepIcon: React.FC<StepIconProps> = ({ type }) => {
  const renderIcon = () => {
    switch (type) {
      case 'location':
        return (
          <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <G>
              <Path
                d="M8 14C8 14 13 10 13 6C13 3.23858 10.7614 1 8 1C5.23858 1 3 3.23858 3 6C3 10 8 14 8 14Z"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z"
                stroke="#000000"
                strokeWidth="1.5"
                fill="none"
              />
            </G>
          </Svg>
        );
      case 'service':
        return (
          <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <G>
              <Path
                d="M2 3H14V13H2V3Z"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M2 7H14"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <Path
                d="M6 3V13"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </G>
          </Svg>
        );
      case 'check':
        return (
          <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <G>
              <Path
                d="M3 8L6.5 11.5L13 4.5"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </G>
          </Svg>
        );
      case 'delivery':
        return (
          <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <G>
              <Path
                d="M3 13V5C3 4.44772 3.44772 4 4 4H12C12.5523 4 13 4.44772 13 5V13"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Path
                d="M8 1V4"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <Path
                d="M6 8H10"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <Path
                d="M1 13H15"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </G>
          </Svg>
        );
      default:
        return null;
    }
  };

  return <View style={styles.iconWrapper}>{renderIcon()}</View>;
};

const styles = StyleSheet.create({
  iconWrapper: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StepIcon;
