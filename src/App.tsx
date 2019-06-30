import React, { Component, ReactElement } from 'react';
import { View } from 'react-native';

import { SoundPlayer } from './common/SoundPlayer';
import { TimeForm } from './components/TimeForm';
import { TimerImage } from './components/TimerImage';

const MS_PER_SEC = 1000;
const UPDATE_BUFFER = 100;

// TODO: make this configurable
const NUM_TICKS = 3;

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
    SoundPlayer.play(endTime, NUM_TICKS);
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
        this.setState({
          active: false,
          remainingSeconds: 0,
        });
      } else if (remainingSeconds < this.state.remainingSeconds) {
        this.setState({ remainingSeconds }, this.waitBeforeUpdate.bind(this));
      } else {
        this.updateTime();
      }
    });
  }

  /**
   * Wait until 100 ms before the next update, then start running updateTime.
   */
  private waitBeforeUpdate(): void {
    setTimeout(this.updateTime.bind(this), (this.state.endTime - Date.now()) % MS_PER_SEC - UPDATE_BUFFER);
  }
}
