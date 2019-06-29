import React, { Component, ReactElement } from 'react';
import { View } from 'react-native';
import Sound from 'react-native-sound';

import { TimeForm } from './components/TimeForm';
import { TimerImage } from './components/TimerImage';

const NUM_TICKS = 3;
const MS_PER_SEC = 1000;

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
const ding = loadSound('ding');

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
    const endTime = Date.now() + seconds * MS_PER_SEC;
    this.setState({
      active: true,
      endTime,
      remainingSeconds: Math.ceil(seconds),
    }, this.updateTime.bind(this));
  }

  /**
   * Recursive function that updates the time until it reaches zero
   */
  private updateTime(): void {
    setTimeout(() => {
      if (!this.state.active) {
        return;
      }
      const remainingSeconds = Math.ceil((this.state.endTime - Date.now()) / MS_PER_SEC);
      if (remainingSeconds === 0) {
        playSound(ding);
        this.setState({
          active: false,
          remainingSeconds: 0,
        });
      } else if (remainingSeconds < this.state.remainingSeconds) {
        if (remainingSeconds <= NUM_TICKS) {
          playSound(tick);
        }
        this.setState({ remainingSeconds }, this.updateTime.bind(this));
      } else {
        this.updateTime();
      }
    });
    // No delay before the next call - I have tried many ways to make it wait until the right time to call itself again.
    // Every way I tried, at least sometimes, would add 10-20ms extra delay.
    // With constant recursion, there's 0-5ms delay between endTime and when the timer actually ends.
    // Times were measured on my Moto G5 Plus.
  }
}
