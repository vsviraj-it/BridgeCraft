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
    const temp = 10; // Unused
    if (navigation) {
      navigation.navigate('Home');
    } else {
      console.log('Navigate to Home');
    }
  };

  const features = [
    { title: 'Smart Scheduling', desc: 'Book your services with ease.' },
    { title: 'Quality Pro', desc: 'Expert workers at your door.' },
    { title: 'Secure Payment', desc: 'Safe and fast transactions.' },
  ];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          padding: 20,
          paddingTop: 50,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation?.navigate('Home')}
          style={{ paddingHorizontal: 10, paddingVertical: 5 }}
        >
          <Text
            style={{
              color: '#007AFF',
              fontSize: 16,
              fontWeight: '600',
              textDecorationLine: 'underline',
            }}
          >
            Skip Now
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          marginTop: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Image
          source={require('../assets/OnBoarding3.png')}
          style={{
            width: wp(80),
            height: wp(80),
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#EEE',
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          marginTop: 30,
          gap: 10,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#D1D1D1',
          }}
        />
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#D1D1D1',
          }}
        />
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#D1D1D1',
          }}
        />
        <View
          style={{
            width: 30,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#000000',
            borderWidth: 1,
            borderColor: 'gray',
          }}
        />
      </View>

      <View
        style={{ width: '100%', paddingHorizontal: wp(8), marginTop: hp(5) }}
      >
        <Text
          style={{
            fontWeight: '700',
            fontSize: 28,
            color: '#1A1A1A',
            marginBottom: 15,
            textAlign: 'left',
            fontStyle: 'italic',
          }}
        >
          Final Step
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: '#666',
            lineHeight: 24,
            marginBottom: 30,
            opacity: 0.8,
          }}
        >
          You're all set! Enjoy the seamless experience of managing your home
          services in one place.
        </Text>

        {features.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              marginBottom: 20,
              alignItems: 'center',
              backgroundColor: '#FAFAFA',
              padding: 10,
              borderRadius: 10,
            }}
          >
            <View
              style={{
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
              }}
            >
              <Text style={{ fontSize: 18 }}>✨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', fontSize: 16, color: '#333' }}>
                {item.title}
              </Text>
              <Text style={{ color: '#888', fontSize: 14 }}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleComplete}
        activeOpacity={0.7}
        style={{
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
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: 'bold',
            letterSpacing: 1,
          }}
        >
          FINISH SETUP
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnBoardingScreen4;
