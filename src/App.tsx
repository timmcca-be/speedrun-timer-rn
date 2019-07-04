import React, { PureComponent, ReactElement } from 'react';
import { View } from 'react-native';

import { SoundPlayer } from './common/SoundPlayer';
import { TimeForm } from './components/TimeForm';
import { TimerImage } from './components/TimerImage';

const MS_PER_SEC = 1000;

// TODO: make this configurable
const NUM_TICKS = 3;

interface IState {
  /** Timer is currently counting down */
  active: boolean;
  /** Time that timer should finish at */
  endTime?: number;
}
/** Container class with timer logic */
export class App extends PureComponent<{}, IState> {
  public constructor(props: {}) {
    super(props);
    this.state = {
      active: false,
    };
  }

  /** Create and return app view */
  public render(): ReactElement {
    return (
      <View>
        <TimerImage {...this.state} end={this.endTimer} />
        <TimeForm active={this.state.active} start={this.startTimer} halt={this.haltTimer} />
      </View>
    );
  }

  /** Stop timer */
  private readonly endTimer = (): void => {
    this.setState({
      active: false,
    });
  }

  /** Stop timer and end sound */
  private readonly haltTimer = (): void => {
    this.endTimer();
    SoundPlayer.cancel();
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
    });
    SoundPlayer.play(endTime, NUM_TICKS);
  }
}
