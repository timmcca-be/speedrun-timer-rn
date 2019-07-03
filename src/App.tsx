import React, { PureComponent, ReactElement } from 'react';
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
  endTime?: number;
  /** Number of remaining seconds on timer, rounded up */
  remainingSeconds: number;
  /** Has the tick sound been started yet? */
  soundStarted: boolean;
}
/** Container class with timer logic */
export class App extends PureComponent<{}, IState> {
  public constructor(props: {}) {
    super(props);
    this.state = {
      active: false,
      remainingSeconds: 0,
      soundStarted: false,
    };
  }

  /** If the timer is running, start waiting for the next update after the time is updated */
  public componentDidUpdate(): void {
    if (this.state.active) {
      this.waitBeforeUpdate();
    }
  }

  /** Create and return app view */
  public render(): ReactElement {
    return (
      <View>
        <TimerImage {...this.state} />
        <TimeForm active={this.state.active} start={this.startTimer} end={this.endTimer} />
      </View>
    );
  }

  /** Stop timer */
  private readonly endTimer = (): void => {
    this.setState({
      active: false,
    });
  }

  /**
   * Start the timer
   * @param seconds Number of seconds to count down
   */
  private readonly startTimer = (seconds: number): void => {
    const endTime = Date.now() + seconds * MS_PER_SEC;
    this.setState({
      active: true,
      endTime,
      remainingSeconds: Math.ceil(seconds),
      soundStarted: false,
    });
  }

  /**
   * Recursive function that updates the time until it reaches zero
   */
  private readonly updateTime = (): void => {
    if (!this.state.active) {
      return;
    }
    if (this.state.endTime === undefined) {
      throw new Error('Timer was started without time');
    }
    const remainingSeconds = Math.ceil((this.state.endTime - Date.now()) / MS_PER_SEC);
    if (remainingSeconds === 0) {
      SoundPlayer.playDing();
      this.setState({
        active: false,
        remainingSeconds: 0,
      });
    } else if (remainingSeconds < this.state.remainingSeconds) {
      if (remainingSeconds <= NUM_TICKS && !this.state.soundStarted) {
        SoundPlayer.playTicks(remainingSeconds);
        this.setState({
          remainingSeconds,
          soundStarted: true,
        });
      } else {
        this.setState({ remainingSeconds });
      }
    } else {
      // Calling this directly stalls the entire JS thread, but setInterval has startup lag
      setTimeout(this.updateTime);
    }
  }

  /**
   * Wait until 100 ms before the next update, then start running updateTime.
   */
  private waitBeforeUpdate(): void {
    if (this.state.endTime === undefined) {
      throw new Error('Timer was started without time');
    }
    setTimeout(this.updateTime, (this.state.endTime - Date.now()) % MS_PER_SEC - UPDATE_BUFFER);
  }
}
