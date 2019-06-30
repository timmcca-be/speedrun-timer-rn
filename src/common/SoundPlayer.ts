import { NativeModules, Platform } from 'react-native';

interface ISoundPlayer {
  /**
   * Play numTicks ticks, one every second ending a second before the timer ends,
   * then play a ding when the timer ends.
   */
  // tslint:disable-next-line:member-ordering
  play(endTime: number, numTicks: number): void;
}

let SoundPlayer: ISoundPlayer;
if (Platform.OS === 'android') {
  // tslint:disable-next-line:no-unsafe-any
  SoundPlayer = NativeModules.SoundPlayer;
} else {
  SoundPlayer = {
    play(_1: number, _2: number): void {
      // TODO
    },
  };
}

export { SoundPlayer };
