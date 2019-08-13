// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import memoizeOne from 'memoize-one';
import React, { PureComponent, ReactElement } from 'react';
import { Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import * as Colors from '../common/Colors';
import * as MillisPer from '../common/MillisPer';

import { Ticks } from './image/Ticks';
import { TimerAnimation } from './image/TimerAnimation';

const MAX_TIMES = [
  // 60 seconds
  MillisPer.MIN,
  // 12 minutes
  MillisPer.MIN * 12,
  // 60 minutes
  MillisPer.HOUR,
  // 12 hours
  MillisPer.HOUR * 12,
  // 24 hours
  MillisPer.DAY,
  // 12 days
  MillisPer.DAY * 12,
  // 60 days
  MillisPer.DAY * 60,
];

const getTimeData = (endTime: number): IMaxTimeData => {
  const duration = endTime - Date.now();
  const maxTime = MAX_TIMES.find((time: number): boolean => duration <= time);
  if (maxTime === undefined) {
    return {
      maxTime: duration,
      timeLabels: new Array(12).fill(''),
    };
  }
  let maxTimeInUnits: number;
  let timeLabels: string[];
  if (maxTime <= MillisPer.MIN) {
    maxTimeInUnits = maxTime / MillisPer.SEC;
    timeLabels = ['sec'];
  } else if (maxTime <= MillisPer.HOUR) {
    maxTimeInUnits = maxTime / MillisPer.MIN;
    timeLabels = ['min'];
  } else if (maxTime <= MillisPer.DAY) {
    maxTimeInUnits = maxTime / MillisPer.HOUR;
    timeLabels = ['hr'];
  } else {
    maxTimeInUnits = maxTime / MillisPer.DAY;
    timeLabels = ['day'];
  }

  const ratio = maxTimeInUnits / 12;
  for (let i = 1; i < 12; i += 1) {
    timeLabels[i] = (i * ratio).toString();
  }

  return {
    maxTime,
    timeLabels,
  };
};

interface IProps {
  /** Timer is currently counting down */
  active: boolean;
  /** Time that timer should finish at */
  endTime?: number;
  /** Function to end timer when stop button is clicked */
  end(): void;
}
interface IMaxTimeData {
  /** Amount of time associated with full timer in milliseconds */
  maxTime: number;
  /** List of labels associated with each bigTick */
  timeLabels: string[];
}
/** SVG image representation of timer with a live display */
export class TimerImage extends PureComponent<IProps> {
  /**
   * Get data for max time on timer
   *  - should only be computed once each time endTime changes
   * @param endTime endTime from state
   */
  private readonly getTimeData = memoizeOne(getTimeData);

  /** Create and return the timer SVG */
  public render(): ReactElement {
    const size: number = Dimensions.get('window').width;
    const endTime = this.props.endTime === undefined ? 0 : this.props.endTime;
    const { maxTime, timeLabels } = this.getTimeData(endTime);

    return (
      <Svg width={size} height={size} viewBox="-50 -50 100 100">
        <Circle
          cx={0} cy={0} r={50}
          fill={Colors.SUBTLE} />
        <Circle
          cx={0} cy={0} r={46}
          fill={Colors.FOREGROUND} />
        <Circle
          cx={0} cy={0} r={43}
          fill={Colors.BACKGROUND} />
        <TimerAnimation {...this.props} maxTime={maxTime} size={size} />
        <Ticks timeLabels={timeLabels} />
      </Svg>
    );
  }
}
