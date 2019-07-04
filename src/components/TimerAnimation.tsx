// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import React, { PureComponent, ReactElement } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { Circle, ClipPath, Defs, G, Line, Rect } from 'react-native-svg';

import * as Colors from '../common/Colors';
import * as MillisPer from '../common/MillisPer';

import { SecondsDisplay } from './SecondsDisplay';

// Not my library, not my monkeys
/* tslint:disable:variable-name no-any no-unsafe-any */
const AnimatedCircle: React.ComponentClass<any> = Animated.createAnimatedComponent(Circle);
const AnimatedG: React.ComponentClass<any> = Animated.createAnimatedComponent(G);
const AnimatedSecondsDisplay: React.ComponentClass<any> = Animated.createAnimatedComponent(SecondsDisplay);
/* tslint:enable:variable-name no-any no-unsafe-any */

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
  private readonly angleAnim = new Animated.Value(1);
  /** Angle of timer line */
  private readonly angleTransform = this.angleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  // These values are always opposite - one is always 0, and one is always 1.
  // Animated paths don't work with this library, so I had to fake it with a few layered semicircles.
  // The logic switches depending on which side of the image the line is on (see the render function for details).
  /** Second half: any time the line is on the right side of the image */
  private readonly secondHalfCircleOpacity = new Animated.Value(1);
  /** First half: any time the line is on the left side of the image */
  // Has to be after second half since its value depends on second half
  // tslint:disable-next-line:member-ordering
  private readonly firstHalfCircleOpacity = this.secondHalfCircleOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  /** Time display animated value */
  private readonly timerAnim = new Animated.Value(0);

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
      this.angleAnim.stopAnimation();
      this.timerAnim.stopAnimation();
      this.secondHalfCircleOpacity.stopAnimation();
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
        <AnimatedSecondsDisplay seconds={this.timerAnim} />
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
    this.timerAnim.setValue(remainingTime / MillisPer.SEC);
    const start = 1 - remainingTime / this.props.maxTime;
    this.angleAnim.setValue(start);

    const duration = remainingTime % MAX_DURATION;
    let end = start + duration / this.props.maxTime;
    let callback: (() => void) | undefined;
    if (remainingTime <= MAX_DURATION) {
      end = 1;
      callback = this.props.end;
    } else {
      end = start + duration / this.props.maxTime;
      callback = this.startAnimation;
    }
    const angleAnimation = Animated.timing(this.angleAnim, {
      duration,
      easing: Easing.linear,
      toValue: end,
      useNativeDriver: true,
    });
    const timerAnimation = Animated.timing(this.timerAnim, {
      duration,
      easing: Easing.linear,
      toValue: (remainingTime - duration) / MillisPer.SEC,
      // Can't use native driver because the time display isn't native
    });

    if (remainingTime <= this.props.maxTime / 2 || remainingTime + duration >= this.props.maxTime / 2) {
      /* If we're already in the second half or we won't get into the second half,
         we only need to do the angle animation */
      this.secondHalfCircleOpacity.setValue(remainingTime <= this.props.maxTime / 2 ? 1 : 0);
      Animated.parallel([angleAnimation, timerAnimation])
        .start(callback);

      return;
    }

    this.secondHalfCircleOpacity.setValue(0);
    const circleAnimation = Animated.sequence([
      // Wait until the timer is at the halfway point
      Animated.delay(remainingTime - MillisPer.SEC * this.props.maxTime / 2),
      // Flip the opacity of the semicircles
      Animated.timing(this.secondHalfCircleOpacity, {
        duration: 0,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]);

    Animated.parallel([angleAnimation, timerAnimation, circleAnimation])
      .start(callback);
  }
}
