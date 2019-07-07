// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import React, { PureComponent, ReactElement } from 'react';
import { Animated, Platform } from 'react-native';
import { Circle, ClipPath, Defs, G, Line, Rect } from 'react-native-svg';

import * as Colors from '../../common/Colors';

// Not my library, not my monkeys
/* tslint:disable:no-any no-unsafe-any */
const AnimatedCircle: React.ComponentClass<any> = Animated.createAnimatedComponent(Circle);
const AnimatedG: React.ComponentClass<any> = Animated.createAnimatedComponent(G);
/* tslint:enable:no-any no-unsafe-any */

interface IProps {
  /** Angle of the timer */
  angleTransform: Animated.Animated;
  /** True if the line is on the left */
  firstHalfAnim: Animated.Animated;
  /** Parent SVG width/height in pixels */
  size: number;
}
/** The animated components of the timer SVG */
export class TimerCircles extends PureComponent<IProps> {
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
          opacity={this.props.firstHalfAnim} />
        {/* During the second half, this semicircle turns on and starts to get covered. */}
        <AnimatedCircle
          cx={0} cy={0} r={31}
          clipPath="url(#rightCircleClip)"
          fill={Colors.RED}
          opacity={Animated.subtract(1, this.props.firstHalfAnim)} />
        {/* This group is the line and white semicircle */}
        <AnimatedG
          style={{
            transform: [
              { translateX: -offsetAndroid },
              { rotate: this.props.angleTransform },
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
          opacity={this.props.firstHalfAnim} />
      </>
    );
  }
}
