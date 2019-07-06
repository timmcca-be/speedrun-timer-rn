// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import React, { PureComponent, ReactElement } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { Circle, ClipPath, Defs, G, Line, Rect } from 'react-native-svg';

import * as Colors from '../common/Colors';
import * as MillisPer from '../common/MillisPer';

import { SecondsDisplay } from './SecondsDisplay';

// Not my library, not my monkeys
/* tslint:disable:no-any no-unsafe-any */
const AnimatedCircle: React.ComponentClass<any> = Animated.createAnimatedComponent(Circle);
const AnimatedG: React.ComponentClass<any> = Animated.createAnimatedComponent(G);
const AnimatedSecondsDisplay: React.ComponentClass<any> = Animated.createAnimatedComponent(SecondsDisplay);
/* tslint:enable:no-any no-unsafe-any */

// Excessively long animations overwhelm the memory, so restrict individual size and daisy-chain them
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

  // These values are always opposite - one is always 0, and one is always 1.
  // Animated paths don't work with this library, so I had to fake it with a few layered semicircles.
  // The logic switches depending on which side of the image the line is on (see the render function for details).
  /** First half: any time the line is on the left side of the image */
  private readonly firstHalfCircleOpacity = new Animated.Value(0);
  /** Second half: any time the line is on the right side of the image */
  private readonly secondHalfCircleOpacity = Animated.subtract(1, this.firstHalfCircleOpacity);

  /** Animated value representing the current time in seconds */
  private readonly timerSecondsAnim = new Animated.Value(0);

  public constructor(props: IProps) {
    super(props);
    this.startAnimation();
  }
  /**
   * If the timer was just activated, start the animation. If it was just deactivated, stop the animation.
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
    const offsetAndroid = Platform.OS === 'android' ? this.props.size / 2 : 0;

    return (
      <>
        <Defs>
          {/* This clip makes the left side of a circle visible */}
          <ClipPath id="leftCircleClip">
            <Rect
              x={-50} y={-50}
              width={50} height={100} />
          </ClipPath>
          {/* ... aaand this one makes the right side of a circle visible */}
          <ClipPath id="rightCircleClip">
            <Rect
              x={0} y={-50}
              width={50} height={100} />
          </ClipPath>
          <ClipPath id="sliverClip">
            <Rect
              x={-0.5} y={-50}
              width={1} height={50} />
          </ClipPath>
        </Defs>
        {/* The timer line, which is above this, has a white semicircle
            attached to its right side (when it is pointed up).
            During the first half, it progressively covers this semicircle on the right side as it rotates. */}
        <AnimatedCircle
          cx={0} cy={0} r={31}
          clipPath="url(#leftCircleClip)"
          fill={Colors.RED}
          opacity={this.firstHalfCircleOpacity} />
        {/* During the second half, this semicircle turns on and starts to get covered. */}
        <AnimatedCircle
          cx={0} cy={0} r={31}
          clipPath="url(#rightCircleClip)"
          fill={Colors.RED}
          opacity={this.secondHalfCircleOpacity} />
        {/* This group is the line and white semicircle */}
        <AnimatedG
          style={{
            transform: [
              { translateX: -offsetAndroid },
              {
                rotate: this.angleTransform,
              },
              { translateX: offsetAndroid },
            ],
          }}>
          <Circle
            cx={0} cy={0} r={32}
            clipPath="url(#rightCircleClip)"
            fill={Colors.WHITE} />
          <Line
            x1={0} y1={0}
            x2={0} y2={-32.3}
            stroke={Colors.RED}
            strokeWidth={1.7}
            strokeLinecap="round" />
        </AnimatedG>
        {/* During the first half, this hides the white semicircle on the right side.
            After that, it disappears so the bottom right semicircle can get covered
            as the white semicircle comes back around. */}
        <AnimatedCircle
          cx={0} cy={0} r={31}
          clipPath="url(#rightCircleClip)"
          fill={Colors.RED}
          opacity={this.firstHalfCircleOpacity} />
        <Circle
          cx={0} cy={0} r={31}
          clipPath="url(#sliverClip)"
          fill={Colors.RED} />
        <Circle
          cx={0} cy={0} r={10}
          fill={Colors.GRAY} />
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

    this.firstHalfCircleOpacity.setValue(remainingTime >= this.props.maxTime / 2 ? 1 : 0);

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
