import { NativeModules, Platform } from 'react-native';

interface ISoundPlayer {
  /** Play ding */
  playDing(): void;
  /** Play numTicks ticks, one every second */
  playTicks(numTicks: number): void;
}

let SoundPlayer: ISoundPlayer;
if (Platform.OS === 'android') {
  // tslint:disable-next-line:no-unsafe-any
  SoundPlayer = NativeModules.SoundPlayer;
} else {
  SoundPlayer = {
    playDing(): void {
      // TODO
    }, playTicks(_2: number): void {
      // TODO
    },
  };
}

export { SoundPlayer };
