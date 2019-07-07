import React, { PureComponent, ReactElement } from 'react';
import { Animated, Dimensions, View } from 'react-native';

import { SoundPlayer } from './common/SoundPlayer';
import { TimeForm } from './components/TimeForm';
import { TimerImage } from './components/TimerImage';

// TODO: make this configurable
const NUM_TICKS = 3;

const MAX_TIMER_SCALE = 0.9;
const MIN_TIMER_SCALE = 0.5;

interface IState {
  /** Timer is currently counting down */
  active: boolean;
  /** Time that timer should finish at */
  endTime?: number;
}
/** Container class with timer logic */
export class App extends PureComponent<{}, IState> {
  /** Timer scale */
  private readonly scaleAnim = new Animated.Value(MIN_TIMER_SCALE);
  /** Margin ratio */
  // tslint:disable-next-line:member-ordering
  private readonly marginAnim = Animated.multiply(Animated.subtract(MAX_TIMER_SCALE, this.scaleAnim), -1);
  /** Timer opacity */
  // tslint:disable-next-line:member-ordering
  private readonly opacityAnim = Animated.add(this.scaleAnim, 1 - MAX_TIMER_SCALE);

  public constructor(props: {}) {
    super(props);
    this.state = {
      active: false,
    };
  }

  /** Create and return app view */
  public render(): ReactElement {
    const translateYAnim = Animated.multiply(this.marginAnim, Dimensions.get('window').width);

    // Disabled for Animated.View
    /* tslint:disable:no-unsafe-any */
    return (
      <View>
        <Animated.View
          style={{
            opacity: this.opacityAnim,
            transform: [{
              // tslint:disable-next-line:no-magic-numbers
              translateY: Animated.divide(translateYAnim, 2),
            }, {
              scale: this.scaleAnim,
            }],
          }}>
          <TimerImage {...this.state} end={this.endTimer} />
        </Animated.View>
        <Animated.View
          style={{
            transform: [ {
              translateY: translateYAnim,
            }],
          }}>
          <TimeForm active={this.state.active} start={this.startTimer} halt={this.haltTimer} />
        </Animated.View>
      </View>
    );
    /* tslint:enable:no-unsafe-any */
  }

  /** Stop timer */
  private readonly endTimer = (): void => {
    this.setState({
      active: false,
    });
    Animated.timing(this.scaleAnim, {
      duration: 200,
      toValue: MIN_TIMER_SCALE,
      useNativeDriver: true,
    })
    .start();
  }

  /** Stop timer and end sound */
  private readonly haltTimer = (): void => {
    this.endTimer();
    SoundPlayer.cancel();
  }

  /**
   * Start the timer
   * @param endTime Time at which timer should end
   */
  private readonly startTimer = (endTime: number): void => {
    this.setState({
      active: true,
      endTime,
    });
    SoundPlayer.play(endTime, NUM_TICKS);
    Animated.timing(this.scaleAnim, {
      duration: 200,
      toValue: MAX_TIMER_SCALE,
      useNativeDriver: true,
    })
    .start();
  }
}
