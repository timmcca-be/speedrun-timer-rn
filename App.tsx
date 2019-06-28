import React, { Component, ReactElement } from 'react';
import { View } from 'react-native';
import Sound from 'react-native-sound';

import { TimeForm } from './components/TimeForm';
import { TimerImage } from './components/TimerImage';

Sound.setCategory('Playback', false);

const NUM_TICKS = 3;
const MS_PER_SEC = 1000;

const loadSound: (name: string) => Promise<Sound> = async (name: string): Promise<Sound> =>
  new Promise<Sound>((resolve: (sound: Sound) => void): void => {
    const sound: Sound = new Sound(`${name}.wav`, Sound.MAIN_BUNDLE, (): void => {
      // Silently playing the sound reduces delay on the first real play
      sound.setVolume(0);
      sound.play();
      resolve(sound);
    });
  });

const playSound: (soundPromise: Promise<Sound>) => Promise<void>
  = async (soundPromise: Promise<Sound>): Promise<void> =>
  soundPromise.then((sound: Sound): void => {
    sound.stop();
    sound.setVolume(1);
    sound.play();
  });

const tick: Promise<Sound> = loadSound('tick');
const ding: Promise<Sound> = loadSound('ding');

interface IState {
  /** Timer is currently counting down */
  active: boolean;
  /** Time that timer should finish at */
  endTime: number;
  /** Number of remaining seconds on timer, rounded up */
  remainingSeconds: number;
}
/** Container class with timer logic */
export class App extends Component<{}, IState> {
  public constructor(props: {}) {
    super(props);
    this.state = {
      active: false,
      endTime: 0,
      remainingSeconds: 0,
    };
  }

  /** Create and return app view */
  public render(): ReactElement {
    return (
      <View>
        <TimerImage {...this.state} />
        <TimeForm active={this.state.active} start={this.startTimer.bind(this)} end={this.endTimer.bind(this)} />
      </View>
    );
  }

  /** Stop timer */
  private endTimer(): void {
    this.setState({
      active: false,
    });
  }

  /**
   * Start the timer
   * @param seconds Number of seconds to count down
   */
  private startTimer(seconds: number): void {
    this.setState({
      active: true,
      endTime: Date.now() + seconds * MS_PER_SEC,
      remainingSeconds: Math.ceil(seconds),
    }, this.updateTime.bind(this));
  }

  /**
   * Recursive function that updates the time until it reaches zero
   */
  private updateTime(): void {
    if (!this.state.active) {
      return;
    }
    const remainingTime = this.state.endTime - Date.now();
    if (remainingTime <= 0) {
      this.setState({
        active: false,
        remainingSeconds: 0,
      });
      // No need to track the sound playing here
      // tslint:disable-next-line:no-floating-promises
      playSound(ding);

      return;
    }
    const remainingSeconds = Math.ceil(remainingTime / MS_PER_SEC);
    if (remainingSeconds < this.state.remainingSeconds) {
      if (remainingSeconds <= NUM_TICKS) {
        // tslint:disable-next-line:no-floating-promises
        playSound(tick);
      }
      this.setState({ remainingSeconds }, this.updateTime.bind(this));
    } else {
      setTimeout(this.updateTime.bind(this));
    }
  }
}
