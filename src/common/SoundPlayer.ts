import { NativeModules, Platform } from 'react-native';

interface ISoundPlayer {
  /** Play ding */
  playDing(): void;
  /** Play numTicks ticks, one every second */
  playTick(): void;
  /** Play a sound silently to reduce lag on first play */
  prepare(): void;
}

let SoundPlayer: ISoundPlayer;
if (Platform.OS === 'android') {
  // tslint:disable-next-line:no-unsafe-any
  SoundPlayer = NativeModules.SoundPlayer;
} else {
  SoundPlayer = {
    playDing(): void {
      // TODO
    }, playTick(): void {
      // TODO
    }, prepare(): void {
      // TODO
    },
  };
}

export { SoundPlayer };
