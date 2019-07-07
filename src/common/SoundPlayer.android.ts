/* The react-native-sound package uses MediaPlayer on Android,
   which has lag, so we roll our own sound module */

import { NativeModules } from 'react-native';

import { ISoundPlayer } from './ISoundPlayer';

// tslint:disable-next-line:no-unsafe-any
export const SoundPlayer: ISoundPlayer = NativeModules.SoundPlayer;
