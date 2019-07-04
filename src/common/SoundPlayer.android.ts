import { NativeModules } from 'react-native';

import { ISoundPlayer } from './ISoundPlayer';

// tslint:disable-next-line:no-unsafe-any
export const SoundPlayer: ISoundPlayer = NativeModules.SoundPlayer;
