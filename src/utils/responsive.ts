import { Platform } from 'react-native';
import {
  widthPercentageToDP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { getStatusBarHeight } from 'react-native-status-bar-height';

export const isIOS = Platform.OS === 'ios';
export const fontSize = (val: number) => RFValue(val, 812);
export const wp = (val: number) => widthPercentageToDP(val);
export const hp = (val: number) => heightPercentageToDP(val);
export const statusBarHeight = parseFloat(
  ((getStatusBarHeight() * 100) / 812).toFixed(2),
);

/** Scroll distance (px) over which home header collapses. Keep in sync with HomeHeader. */
export const HOME_HEADER_SCROLL_RANGE = 120;
