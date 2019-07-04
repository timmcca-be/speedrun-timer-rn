// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import memoizeOne from 'memoize-one';
import React, { Component, ReactElement } from 'react';
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
  // 60 days
  SECS_PER_DAY * 60,
];

/**
 * Format time to go in timer
 * @param seconds Number of seconds remaining
 */
const getFormattedTime = (seconds: number): string => {
  if (seconds === 0) {
    return '';
  } if (seconds <= SECS_PER_MIN) {
    return seconds.toString();
  }

  let smallUnit: number;
  let bigUnit: number;
  let bigUnitText: string;
  if (seconds <= SECS_PER_HOUR) {
    smallUnit = 1;
    bigUnit = SECS_PER_MIN;
    bigUnitText = 'm';
  } else if (seconds <= SECS_PER_DAY) {
    smallUnit = SECS_PER_MIN;
    bigUnit = SECS_PER_HOUR;
    bigUnitText = 'h';
  } else {
    smallUnit = SECS_PER_HOUR;
    bigUnit = SECS_PER_DAY;
    bigUnitText = 'd';
  }

  const bigUnitAmount = seconds / bigUnit;
  if (bigUnitAmount >= 10) {
    return `${Math.ceil(bigUnitAmount)}${bigUnitText}`;
  }

  return `${Math.floor(bigUnitAmount)}${bigUnitText}${Math.ceil((seconds % bigUnit) / smallUnit)}`;
};

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
export class TimerImage extends Component<IProps> {
  /**
   * Format time to go in timer, memoized to store the last output
   * @param seconds Number of seconds remaining
   */
  private readonly getFormattedTime = memoizeOne(getFormattedTime);
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
      units = 'sec';
    } else if (maxTime <= SECS_PER_HOUR) {
      maxTimeInUnits = maxTime / SECS_PER_MIN;
      units = 'min';
    } else if (maxTime <= SECS_PER_DAY) {
      maxTimeInUnits = maxTime / SECS_PER_HOUR;
      units = 'hr';
    } else {
      maxTimeInUnits = maxTime / SECS_PER_DAY;
      units = 'day';
    }

    const timeLabels: string[] = new Array(12);
    const ratio = maxTimeInUnits / 12;
    for (let i = 0; i < 12; i += 1) {
      timeLabels[i] = maxTime === Infinity
        ? (i === 0 ? '0' : '')
        : (i === 0 ? units : (i * ratio).toString());
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
    const timeText = this.getFormattedTime(this.props.remainingSeconds);

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
          cx={0} cy={0} r={10}
          fill={Colors.GRAY} />
        <Text
          x={0} y={timeText.length > 2 ? 2.2 : 3.2}
          textAnchor="middle"
          fontFamily="BetecknaLowerCase"
          fontSize={timeText.length > 2 ? 7 : 9}
          fill={Colors.BLACK}>
          {timeText}
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

  /** Only update if the time displayed should be different or if another prop has changed */
  public shouldComponentUpdate(nextProps: IProps): boolean {
    return this.props.active !== nextProps.active
      || this.props.endTime !== nextProps.endTime
      || (this.props.remainingSeconds !== nextProps.remainingSeconds
        // Reminder that the order here is critical - flipping these will remove the memoization benefits
        && this.getFormattedTime(this.props.remainingSeconds) !== this.getFormattedTime(nextProps.remainingSeconds));
  }
}
