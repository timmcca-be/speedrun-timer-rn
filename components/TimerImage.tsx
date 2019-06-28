// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import React, { Component, ReactElement } from 'react';
import { Animated, Dimensions, Easing, Platform } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Rect, Text } from 'react-native-svg';
// Not my library, not my monkeys
/* tslint:disable:variable-name no-any no-unsafe-any */
const AnimatedCircle: React.ComponentClass<any> = Animated.createAnimatedComponent(Circle);
const AnimatedG: React.ComponentClass<any> = Animated.createAnimatedComponent(G);
/* tslint:enable:variable-name no-any no-unsafe-any */

/** Tick on timer */
interface ITick {
  /** Outer x coordinate */
  x1: number;
  /** Outer y coordinate */
  y1: number;
  /** Inner x coordinate */
  // tslint:disable-next-line:member-ordering
  x2: number;
  /** Inner y coordinate */
  y2: number;
}

/** Position of bottom center of number label on timer */
interface ILabel {
  /** x coordinate */
  x: string;
  /** y coordinate */
  y: string;
}

const bigTicks: ITick[] = new Array(12);
const smallTicks: ITick[] = new Array(48);
const labels: ILabel[] = new Array(12);
for (let i = 0; i < 60; i += 1) {
  const rad: number = i * Math.PI / 30;
  const cos: number = Math.cos(rad);
  const sin: number = Math.sin(rad);
  if (i % 5 === 0) {
    bigTicks[i / 5] = {
      x1: cos * 28,
      y1: sin * 28,
      // tslint:disable-next-line:object-literal-sort-keys
      x2: cos * 17,
      y2: sin * 17,
    };
    labels[i / 5] = {
      x: (sin * 33).toFixed(4),
      y: (-cos * 33).toFixed(4),
    };
  } else {
    smallTicks[i - Math.floor(i / 5)] = {
      x1: cos * 28,
      y1: sin * 28,
      // tslint:disable-next-line:object-literal-sort-keys
      x2: cos * 24,
      y2: sin * 24,
    };
  }
}

/** String to string key-value map for color names */
interface IColors {
  [key: string]: string;
}
const colors: IColors = {
  black: '#2d2d2b',
  gray: '#aaa5a2',
  red: '#ff2e00',
  white: '#f1f1f1',
};

const angleAnim = new Animated.Value(1);
const angleTransform = angleAnim.interpolate({
  inputRange: [0, 1],
  outputRange: ['360deg', '0deg'],
});

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
}
/** SVG image representation of timer with a live display */
export class TimerImage extends Component<IProps> {
  /**
   * If the timer was just activated, start the animation. If it was just deactivated, stop the animation.
   * @param prevProps previous props
   */
  public componentDidUpdate(prevProps: IProps): void {
    if (!this.props.active && this.props.remainingSeconds !== 0) {
      angleAnim.stopAnimation();
      secondHalfCircleOpacity.stopAnimation();
    } else if (this.props.active && !prevProps.active) {
      const remainingTime = this.props.endTime - Date.now();
      const start = 1 - remainingTime / 60000;
      angleAnim.setValue(start);
      const angleAnimation = Animated.timing(angleAnim, {
        duration: remainingTime,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      });
      if (remainingTime > 30000) {
        secondHalfCircleOpacity.setValue(0);
        Animated.parallel([
          angleAnimation,
          Animated.sequence([
            Animated.delay(remainingTime - 30000),
            Animated.timing(secondHalfCircleOpacity, {
              duration: 0,
              toValue: 1,
              useNativeDriver: true,
            }),
          ]),
        ])
        .start();
      } else {
        angleAnimation.start();
      }
    }
  }

  /** Create and return the timer SVG */
  public render(): ReactElement {
    const size: number = Dimensions.get('window').width * 0.9;
    const offsetAndroid = Platform.OS === 'android' ? size / 2 : 0;

    return (
      <Svg width={size} height={size} viewBox="-50 -50 100 100" style={{ margin: '5%' }}>
        <Defs>
          <ClipPath id="leftCircleClip">
            <Rect
              x={-50} y={-50}
              width={50} height={100} />
          </ClipPath>
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
        <Circle
          cx={0} cy={0} r={50}
          fill={colors.gray} />
        <Circle
          cx={0} cy={0} r={46}
          fill={colors.black} />
        <Circle
          cx={0} cy={0} r={43}
          fill={colors.white} />
        <AnimatedCircle
          cx={0} cy={0} r={31}
          clipPath="url(#leftCircleClip)"
          fill={colors.red}
          opacity={firstHalfCircleOpacity} />
        <AnimatedCircle
          cx={0} cy={0} r={31}
          clipPath="url(#rightCircleClip)"
          fill={colors.red}
          opacity={secondHalfCircleOpacity} />
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
          <AnimatedCircle
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
        <AnimatedCircle
          cx={0} cy={0} r={31}
          clipPath="url(#rightCircleClip)"
          fill={colors.red}
          opacity={firstHalfCircleOpacity} />
        <Circle
          cx={0} cy={0} r={31}
          clipPath="url(#sliverClip)"
          fill={colors.red} />
        <Circle
          cx={0} cy={0} r={9}
          fill={colors.gray} />
        <Text
          x={0} y={3.2}
          textAnchor="middle"
          fontFamily="BetecknaLowerCase"
          fontSize={10}
          fill={colors.black}>
          {this.props.remainingSeconds === 0 ? '' : this.props.remainingSeconds}
        </Text>
        {
          bigTicks.map((tick: ITick, i: number) => (
            <Line key={i}
              x1={tick.x1} y1={tick.y1}
              x2={tick.x2} y2={tick.y2}
              stroke={colors.black}
              strokeWidth={0.6}
              strokeLinecap="round" />
          ))
        }
        {
          smallTicks.map((tick: ITick, i: number) => (
            <Line key={i}
              x1={tick.x1} y1={tick.y1}
              x2={tick.x2} y2={tick.y2}
              stroke={colors.black}
              strokeWidth={0.25}
              strokeLinecap="round" />
          ))
        }
        {
          labels.map((label: ILabel, i: number) => (
            <Text key={i}
              x={0} y={0}
              transform={`translate(${label.x},${label.y}) rotate(${i * 30})`}
              textAnchor="middle"
              fontFamily="BetecknaLowerCase"
              fontSize={8}
              fill={colors.black}>
              {i * 5}
            </Text>
          ))
        }
      </Svg>
    );
  }
}
