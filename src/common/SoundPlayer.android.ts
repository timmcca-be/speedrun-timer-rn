// The react-native-sound package uses MediaPlayer on Android, which has lag, so we roll our own sound module

import { NativeModules } from 'react-native';

interface ISoundPlayer {
    /** Play ding */
    playDing(): void;
    /** Play numTicks ticks, one every second */
    playTick(): void;
    /** Play a sound silently to reduce lag on first play */
    prepare(): void;
}

// tslint:disable-next-line:no-unsafe-any
export const SoundPlayer: ISoundPlayer = NativeModules.SoundPlayer;
