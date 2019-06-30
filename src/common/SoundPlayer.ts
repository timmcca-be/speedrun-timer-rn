import { NativeModules, Platform } from 'react-native';
/* import Sound from 'react-native-sound';

const loadSound: (name: string) => Promise<Sound> = async (name: string): Promise<Sound> =>
  new Promise<Sound>((resolve: (sound: Sound) => void): void => {
    const sound: Sound = new Sound(`${name}.wav`, Sound.MAIN_BUNDLE, (): void => { resolve(sound); });
  });

const playSound = (soundPromise: Promise<Sound>): void => {
  soundPromise.then((sound: Sound): void => {
    sound.stop();
    sound.play();
  });
};

const tick = loadSound('tick');
const ding = loadSound('ding');*/

interface ISoundPlayer {
  /** Play the sound */
  // tslint:disable-next-line:member-ordering
  play(endTime: number, numTicks: number): void;
}

// tslint:disable-next-line:variable-name
let SoundPlayer: ISoundPlayer;
if (Platform.OS === 'android') {
  // tslint:disable-next-line:no-unsafe-any
  SoundPlayer = NativeModules.SoundPlayer;
} else {
  SoundPlayer = {
    play(sound: number, numTicks: number): void {
      // TODO
    },
  };
}

export { SoundPlayer };
