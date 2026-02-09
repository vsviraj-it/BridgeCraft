import { NativeModules, NativeEventEmitter } from 'react-native';

const { NetworkSpeed } = NativeModules;

const emitter = new NativeEventEmitter(NetworkSpeed);

export const startNetworkSpeed = (callback: (data: any) => void) => {
  NetworkSpeed.startMonitoring();
  return emitter.addListener('NetworkSpeedUpdate', callback);
};

export const stopNetworkSpeed = () => {
  NetworkSpeed.stopMonitoring();
};
