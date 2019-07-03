// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import memoizeOne from 'memoize-one';
import React, { PureComponent, ReactElement } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Line, Rect, Text } from 'react-native-svg';

import * as Colors from '../common/Colors';

import { TimerAnimation } from './TimerAnimation';

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
// Time labels associated with each bigTick (e.g. 0, 5, 10, ...)
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
    // -cos here because the array index actually has to be associated with the position.
    // Without this, the text would be in the wrong spot and upside down.
    // For the ticks, it doesn't matter which one is in which index.
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

const SECS_PER_MIN = 60;
const SECS_PER_HOUR = SECS_PER_MIN * 60;
const SECS_PER_DAY = SECS_PER_HOUR * 24;
const SECS_PER_WEEK = SECS_PER_DAY * 7;

const MAX_TIMES = [
  // 60 seconds
  SECS_PER_MIN,
  // 12 minutes
  SECS_PER_MIN * 12,
  // 60 minutes
  SECS_PER_HOUR,
  // 12 hours
  SECS_PER_HOUR * 12,
  // 24 hours
  SECS_PER_DAY,
  // 12 days
  SECS_PER_DAY * 12,
  // 12 weeks
  SECS_PER_WEEK * 12,
  // 60 weeks
  SECS_PER_WEEK * 60,
  // 720 weeks
  SECS_PER_WEEK * 720,
];

const defaultTimeLabels: string[] = new Array(12);
for (let i = 0; i < 12; i += 1) {
  defaultTimeLabels[i] = (i * 5).toString();
}

interface IProps {
  /** Timer is currently counting down */
  active: boolean;
  /** Time that timer should finish at */
  endTime?: number;
  /** Number of remaining seconds on timer, rounded up */
  remainingSeconds: number;
}
interface IMaxTimeData {
  /** Amount of time associated with full timer in seconds */
  maxTime: number;
  /** List of labels associated with each bigTick */
  timeLabels: string[];
}
/** SVG image representation of timer with a live display */
export class TimerImage extends PureComponent<IProps> {
  /**
   * Get data for max time on timer
   * @param endTime endTime from state
   */
  private readonly getTimeData = memoizeOne((endTime: number): IMaxTimeData => {
    const duration = (endTime - Date.now()) / 1000;
    let maxTime = MAX_TIMES.find((time: number): boolean => duration <= time);
    maxTime = maxTime === undefined ? Infinity : maxTime;
    let maxTimeInUnits: number;
    let units: string;
    if (maxTime <= SECS_PER_MIN) {
      maxTimeInUnits = maxTime;
      units = '';
    } else if (maxTime <= SECS_PER_HOUR) {
      maxTimeInUnits = maxTime / SECS_PER_MIN;
      units = 'm';
    } else if (maxTime <= SECS_PER_DAY) {
      maxTimeInUnits = maxTime / SECS_PER_HOUR;
      units = 'h';
    } else if (maxTime <= SECS_PER_WEEK * 12) {
      maxTimeInUnits = maxTime / SECS_PER_DAY;
      units = 'd';
    } else {
      maxTimeInUnits = maxTime / SECS_PER_WEEK;
      units = 'w';
    }

    const timeLabels: string[] = new Array(12);
    const ratio = maxTimeInUnits / 12;
    for (let i = 0; i < 12; i += 1) {
      timeLabels[i] = maxTime === Infinity
        ? (i === 0 ? '0' : '')
        : `${i * ratio}${units}`;
    }

    return {
      maxTime,
      timeLabels,
    };
  });

  /** Create and return the timer SVG */
  public render(): ReactElement {
    const size: number = Dimensions.get('window').width * 0.9;

    const { maxTime, timeLabels } = this.getTimeData(this.props.endTime === undefined ? 60 : this.props.endTime);

    return (
      <Svg width={size} height={size} viewBox="-50 -50 100 100" style={{ margin: '5%' }}>
        <Defs>
          <ClipPath id="sliverClip">
            <Rect
              x={-0.5} y={-50}
              width={1} height={50} />
          </ClipPath>
        </Defs>
        <Circle
          cx={0} cy={0} r={50}
          fill={Colors.GRAY} />
        <Circle
          cx={0} cy={0} r={46}
          fill={Colors.BLACK} />
        <Circle
          cx={0} cy={0} r={43}
          fill={Colors.WHITE} />
        <TimerAnimation {...this.props} maxTime={maxTime} size={size} />
        <Circle
          cx={0} cy={0} r={31}
          clipPath="url(#sliverClip)"
          fill={Colors.RED} />
        <Circle
          cx={0} cy={0} r={9}
          fill={Colors.GRAY} />
        <Text
          x={0} y={3.2}
          textAnchor="middle"
          fontFamily="BetecknaLowerCase"
          fontSize={10}
          fill={Colors.BLACK}>
          {this.props.remainingSeconds === 0 ? '' : this.props.remainingSeconds}
        </Text>
        {
          bigTicks.map((tick: ITick, i: number) => (
            <Line key={i}
              x1={tick.x1} y1={tick.y1}
              x2={tick.x2} y2={tick.y2}
              stroke={Colors.BLACK}
              strokeWidth={0.6}
              strokeLinecap="round" />
          ))
        }
        {
          smallTicks.map((tick: ITick, i: number) => (
            <Line key={i}
              x1={tick.x1} y1={tick.y1}
              x2={tick.x2} y2={tick.y2}
              stroke={Colors.BLACK}
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
              fill={Colors.BLACK}>
              {timeLabels[i]}
            </Text>
          ))
        }
      </Svg>
    );
  }
}
