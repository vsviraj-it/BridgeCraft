import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { wp, hp } from '../../utils/responsive';

interface OnBoardingImageProps {
  source: ImageSourcePropType;
}

const OnBoardingImage: React.FC<OnBoardingImageProps> = ({ source }) => {
  return (
    <View style={styles.imageContainer}>
      <Image style={styles.image} source={source} />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: wp(100),
    height: hp(48),
    marginTop: hp(9.6),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: hp(387.58),
    resizeMode: 'contain',
  },
});

export default OnBoardingImage;
