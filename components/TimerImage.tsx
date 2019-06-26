// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import React, { Component, ReactElement } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';
import Svg, { Circle, Defs, Line, Mask, Path, Rect, Text } from 'react-native-svg';
// Not my library, not my monkeys
/* tslint:disable:variable-name no-any no-unsafe-any */
const AnimatedPath: React.ComponentClass<any> = Animated.createAnimatedComponent(Path);
const AnimatedLine: React.ComponentClass<any> = Animated.createAnimatedComponent(Line);
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
      x1: cos * 28 + 50,
      y1: sin * 28 + 50,
      // tslint:disable-next-line:object-literal-sort-keys
      x2: cos * 17 + 50,
      y2: sin * 17 + 50
    };
    labels[i / 5] = {
      x: (sin * 33 + 50).toFixed(4),
      y: (50 - cos * 33).toFixed(4)
    };
  } else {
    smallTicks[i - Math.floor(i / 5)] = {
      x1: cos * 28 + 50,
      y1: sin * 28 + 50,
      // tslint:disable-next-line:object-literal-sort-keys
      x2: cos * 24 + 50,
      y2: sin * 24 + 50
    };
  }
}

const NUM_KEYFRAMES = 120;

/** Endpoint of animated timer line */
interface ILinePoint {
  /** x coordinate */
  x: number;
  /** y coordinate */
  y: number;
}

// 0 to 1 in NUM_KEYFRAMES + 1 evenly-spaced steps
const inputRange: number[] = new Array(NUM_KEYFRAMES + 1);
// Index NUM_KEYFRAMES is the path at time 0, time goes up as the index decreases
const circlePaths: string[] = new Array(NUM_KEYFRAMES + 1);
const lineXCoordinates: number[] = new Array(NUM_KEYFRAMES + 1);
const lineYCoordinates: number[] = new Array(NUM_KEYFRAMES + 1);
for (let i = 0; i <= NUM_KEYFRAMES; i += 1) {
  inputRange[i] = i;
  const rad: number = (NUM_KEYFRAMES - i) * Math.PI * 2 / NUM_KEYFRAMES;
  const cos: number = Math.cos(rad);
  const sin: number = Math.sin(rad);
  lineXCoordinates[i] = sin * 32.3 + 50;
  lineYCoordinates[i] = 50 - cos * 32.3;
  circlePaths[i] = `M50 50L50 19A31 31 0 ${i <= 60 ? '1' : '0'} 1 \
    ${(sin * 31 + 50).toFixed(4)} ${(50 - cos * 31).toFixed(4)}`;
}

/** String to string key-value map for color names */
interface IColors {
  [key: string]: string;
}
const colors: IColors = {
  black: '#2d2d2b',
  gray: '#aaa5a2',
  red: '#ff2e00',
  white: '#f1f1f1'
};

interface IProps {
  /** Timer is currently counting down */
  active: boolean;
  /** Time that timer should finish at */
  endTime: number;
  /** Number of remaining seconds on timer, rounded up */
  remainingSeconds: number;
}
interface IState {
  /** Animates paths and controls animation flow */
  anim: Animated.Value;
  /** Animated path for red timer circle */
  circlePath: Animated.AnimatedInterpolation;
  /** Animated x coordinate for red timer line */
  lineXCoordinate: Animated.AnimatedInterpolation;
  /** Animated y coordinate for red timer line */
  lineYCoordinate: Animated.AnimatedInterpolation;
}

/** SVG image representation of timer with a live display */
export class TimerImage extends Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    const anim: Animated.Value = new Animated.Value(120);
    this.state = {
      anim,
      circlePath: anim.interpolate({
        inputRange,
        outputRange: circlePaths
      }),
      lineXCoordinate: anim.interpolate({
        inputRange,
        outputRange: lineXCoordinates
      }),
      lineYCoordinate: anim.interpolate({
        inputRange,
        outputRange: lineYCoordinates
      })
    };
  }

  /**
   * If the timer was just activated, start the animation. If it was just deactivated, stop the animation.
   * @param prevProps previous props
   */
  public componentDidUpdate(prevProps: IProps): void {
    if (!this.props.active && this.props.remainingSeconds !== 0) {
      this.state.anim.stopAnimation();
    } else if (this.props.active && !prevProps.active) {
      const remainingTime: number = this.props.endTime - Date.now();
      this.state.anim.setValue(120 - remainingTime / 500);
      Animated.timing(this.state.anim, {
        duration: remainingTime,
        easing: Easing.linear,
        toValue: 120,
        useNativeDriver: true
      })
      .start();
    }
  }

  /** Create and return the timer SVG */
  public render(): ReactElement {
    const size: number = Dimensions.get('window').width * 0.9;

    return (
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '5%' }}>
        <Defs>
          <Mask id="sliverMask">
            <Rect
              x={49.5} y={0}
              width={1} height={50}
              fill="#ffffff" />
          </Mask>
        </Defs>
        <Circle
          cx={50} cy={50} r={50}
          fill={colors.gray} />
        <Circle
          cx={50} cy={50} r={46}
          fill={colors.black} />
        <Circle
          cx={50} cy={50} r={43}
          fill={colors.white} />
        <Circle
          cx={50} cy={50} r={31}
          mask="url(#sliverMask)"
          fill={colors.red} />
        <AnimatedPath
          d={this.state.circlePath}
          fill={colors.red} />
        <AnimatedLine
          x1={50} y1={50}
          x2={this.state.lineXCoordinate} y2={this.state.lineYCoordinate}
          stroke={colors.red}
          strokeWidth={1.7}
          strokeLinecap="round" />
        <Circle
          cx={50} cy={50} r={9}
          fill={colors.gray} />
        <Text
          x={50} y={53.2}
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
