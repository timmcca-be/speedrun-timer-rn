// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import React, { PureComponent, ReactElement } from 'react';
import { Animated, Easing } from 'react-native';
import { Circle } from 'react-native-svg';

import * as Colors from '../../common/Colors';
import * as MillisPer from '../../common/MillisPer';

import { SecondsDisplay } from './SecondsDisplay';
import { TimerCircles } from './TimerCircles';

// Not my library, not my monkeys
/* tslint:disable:no-any no-unsafe-any */
const AnimatedSecondsDisplay: React.ComponentClass<any> =
  Animated.createAnimatedComponent(SecondsDisplay);
/* tslint:enable:no-any no-unsafe-any */

/* Excessively long animations overwhelm the memory,
   so restrict individual size and daisy-chain them */
const MAX_DURATION = MillisPer.SEC * 10;

interface IProps {
  /** Timer is currently counting down */
  active: boolean;
  /** Time that timer should finish at */
  endTime?: number;
  /** Maximum time on the timer in milliseconds */
  maxTime: number;
  /** Parent SVG width/height in pixels */
  size: number;
  /** Function to end timer when stop button is clicked */
  end(): void;
}
/** The animated components of the timer SVG */
export class TimerAnimation extends PureComponent<IProps> {
  /** Determines angle of timer line */
  private readonly angleAnim = new Animated.Value(0);
  /** Angle of timer line */
  private readonly angleTransform = this.angleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  /**
   * 1 if the timer line is on the left, 0 otherwise
   * This is animated because rerendering during an animation causes a hiccup
   */
  private readonly firstHalfAnim = new Animated.Value(0);

  /** Animated value representing the current time in seconds */
  private readonly timerSecondsAnim = new Animated.Value(0);

  public constructor(props: IProps) {
    super(props);
    this.state = {
      firstHalf: false,
    };
  }
  /**
   * If the timer was just activated, start the animation.
   * If it was just deactivated, stop the animation.
   * @param prevProps previous props
   */
  public componentDidUpdate(prevProps: IProps): void {
    if (prevProps.active && !this.props.active) {
      this.timerSecondsAnim.stopAnimation();
    } else if (!prevProps.active) {
      // If the timer was just started, start the animation
      this.startAnimation();
    }
  }

  /** Create and return the animated part of the timer SVG */
  public render(): ReactElement {
    return (
      <>
        <TimerCircles
          angleTransform={this.angleTransform}
          firstHalfAnim={this.firstHalfAnim}
          size={this.props.size} />
        <Circle
          cx={0} cy={0} r={31}
          clipPath="url(#sliverClip)"
          fill={Colors.ACCENT} />
        <Circle
          cx={0} cy={0} r={10}
          fill={Colors.SUBTLE} />
        <AnimatedSecondsDisplay seconds={this.timerSecondsAnim} />
      </>
    );
  }

  /** Start the animation */
  private readonly startAnimation = (): void => {
    if (!this.props.active) {
      return;
    }
    if (this.props.endTime === undefined) {
      throw new Error('Timer was started without time');
    }

    const remainingTime = this.props.endTime - Date.now();
    const duration = remainingTime % MAX_DURATION;
    const remainingTimeAtEnd = remainingTime - duration;

    this.firstHalfAnim.setValue(
      remainingTime >= this.props.maxTime / 2 ? 1 : 0);

    this.timerSecondsAnim.setValue(remainingTime / MillisPer.SEC);
    this.angleAnim.setValue(remainingTime / this.props.maxTime);

    Animated.parallel([Animated.timing(this.timerSecondsAnim, {
      duration,
      easing: Easing.linear,
      toValue: remainingTimeAtEnd / MillisPer.SEC,
      // Can't use native driver because the display is not native
    }), Animated.timing(this.angleAnim, {
      duration,
      easing: Easing.linear,
      toValue: remainingTimeAtEnd / this.props.maxTime,
      useNativeDriver: true,
    })])
    .start(remainingTimeAtEnd === 0 ? this.props.end : this.startAnimation);
  }
}
