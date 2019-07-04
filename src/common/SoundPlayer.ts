import Sound from 'react-native-sound';

const loadSound: (name: string) => Promise<Sound> = async (name: string): Promise<Sound> =>
  new Promise<Sound>((resolve: (sound: Sound) => void): void => {
    const sound = new Sound(`${name}.wav`, Sound.MAIN_BUNDLE, (): void => {
      resolve(sound);
    });
  });

const playSound: (soundPromise: Promise<Sound>) => Promise<void>
  = async (soundPromise: Promise<Sound>): Promise<void> => {
  const sound = await soundPromise;
  sound.stop();
  sound.setVolume(1);
  sound.play();
};

const tick: Promise<Sound> = loadSound('tick');
const ding: Promise<Sound> = loadSound('ding');

// Don't need to track sound
/* tslint:disable:no-floating-promises */
export const SoundPlayer = {
  playDing(): void {
    playSound(ding);
  }, playTick(): void {
    playSound(tick);
  }, prepare(): void {
    // Don't need to do anything here
  },
};
