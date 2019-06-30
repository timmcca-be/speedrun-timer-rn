// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import React, { Component, ReactElement } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { Circle, ClipPath, Defs, G, Line, Rect } from 'react-native-svg';

import { colors } from '../common/colors';

// Not my library, not my monkeys
/* tslint:disable:variable-name no-any no-unsafe-any */
const AnimatedCircle: React.ComponentClass<any> = Animated.createAnimatedComponent(Circle);
const AnimatedG: React.ComponentClass<any> = Animated.createAnimatedComponent(G);
/* tslint:enable:variable-name no-any no-unsafe-any */

const MS_PER_MINUTE = 60000;

// Determines angle of timer line
const angleAnim = new Animated.Value(1);
const angleTransform = angleAnim.interpolate({
  inputRange: [0, 1],
  outputRange: ['360deg', '0deg'],
});

// First half: any time the line is on the left side of the image
// Second half: any time the line is on the right side of the image
// These values are always opposite - one is always 0, and one is always 1.
// Animated paths don't work with this library, so I had to fake it with a few layered semicircles.
// The logic switches depending on which side of the image the line is on (see the render function for details).
const secondHalfCircleOpacity = new Animated.Value(1);
const firstHalfCircleOpacity = secondHalfCircleOpacity.interpolate({
  inputRange: [0, 1],
  outputRange: [1, 0],
});

interface IProps {
  /** Timer is currently counting down */
  active: boolean;
  /** Time that timer should finish at */
  endTime: number;
  /** Number of remaining seconds on timer, rounded up */
  remainingSeconds: number;
  /** Parent SVG width/height in pixels */
  size: number;
}
/** The animated components of the timer SVG */
export class TimerAnimation extends Component<IProps> {
  /**
   * If the timer was just activated, start the animation. If it was just deactivated, stop the animation.
   * @param prevProps previous props
   */
  public componentDidUpdate(prevProps: IProps): void {
    if (!this.props.active && this.props.remainingSeconds !== 0) {
      // If remainingTime is zero, we let the animation naturally end in case it is behind the timer.
      angleAnim.stopAnimation();
      secondHalfCircleOpacity.stopAnimation();

      return;
    }

    if (prevProps.active || !this.props.active) {
      // If the animation was started before or if it is not supposed to be running, don't start it
      return;
    }

    const remainingTime = this.props.endTime - Date.now();
    const start = 1 - remainingTime / MS_PER_MINUTE;
    angleAnim.setValue(start);
    const angleAnimation = Animated.timing(angleAnim, {
      duration: remainingTime,
      easing: Easing.linear,
      toValue: 1,
      useNativeDriver: true,
    });

    if (remainingTime <= MS_PER_MINUTE / 2) {
      // If we're already in the second half, we only need to do the angle animation
      secondHalfCircleOpacity.setValue(1);
      angleAnimation.start();

      return;
    }

    secondHalfCircleOpacity.setValue(0);
    const circleAnimation = Animated.sequence([
      // Wait until the timer is at the halfway point
      Animated.delay(remainingTime - MS_PER_MINUTE / 2),
      // Flip the opacity of the semicircles
      Animated.timing(secondHalfCircleOpacity, {
        duration: 0,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]);

    Animated.parallel([angleAnimation, circleAnimation])
      .start();
  }

  /** Create and return the animated part of the timer SVG */
  public render = (): ReactElement => {
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
        </Defs>
        {/* The timer line, which is above this, has a white semicircle
            attached to its right side (when it is pointed up).
            During the first half, it progressively covers this semicircle on the right side as it rotates. */}
        <AnimatedCircle
          cx={0} cy={0} r={31}
          clipPath="url(#leftCircleClip)"
          fill={colors.red}
          opacity={firstHalfCircleOpacity} />
        {/* During the second half, this semicircle turns on and starts to get covered. */}
        <AnimatedCircle
          cx={0} cy={0} r={31}
          clipPath="url(#rightCircleClip)"
          fill={colors.red}
          opacity={secondHalfCircleOpacity} />
        {/* This group is the line and white semicircle */}
        <AnimatedG
          style={{
            transform: [
              { translateX: -offsetAndroid },
              {
                rotate: angleTransform,
              },
              { translateX: offsetAndroid },
            ],
          }}>
          <Circle
            cx={0} cy={0} r={32}
            clipPath="url(#rightCircleClip)"
            fill={colors.white} />
          <Line
            x1={0} y1={0}
            x2={0} y2={-32.3}
            stroke={colors.red}
            strokeWidth={1.7}
            strokeLinecap="round" />
        </AnimatedG>
        {/* During the first half, this hides the white semicircle on the right side.
            After that, it disappears so the bottom right semicircle can get covered
            as the white semicircle comes back around. */}
        <AnimatedCircle
          cx={0} cy={0} r={31}
          clipPath="url(#rightCircleClip)"
          fill={colors.red}
          opacity={firstHalfCircleOpacity} />
      </>
    );
  }
}
