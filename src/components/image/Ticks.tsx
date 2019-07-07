// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import React, { PureComponent, ReactElement } from 'react';
import { Line, Text } from 'react-native-svg';

import * as Colors from '../../common/Colors';

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

const bigTicks: ITick[] = [];
const smallTicks: ITick[] = [];
// Time labels associated with each bigTick (e.g. 0, 5, 10, ...)
const labels: ILabel[] = [];
for (let i = 0; i < 60; i += 1) {
  const rad: number = i * Math.PI / 30;
  const cos: number = Math.cos(rad);
  const sin: number = Math.sin(rad);
  if (i % 5 === 0) {
    bigTicks.push({
      x1: cos * 28,
      y1: sin * 28,
      // tslint:disable-next-line:object-literal-sort-keys
      x2: cos * 17,
      y2: sin * 17,
    });
    // -cos here because the array index has to be associated with the position.
    // Without this, the text would be in the wrong spot and upside down.
    // For the ticks, it doesn't matter which one is in which index.
    labels.push({
      x: (sin * 33).toFixed(4),
      y: (-cos * 33).toFixed(4),
    });
  } else {
    smallTicks.push({
      x1: cos * 28,
      y1: sin * 28,
      // tslint:disable-next-line:object-literal-sort-keys
      x2: cos * 24,
      y2: sin * 24,
    });
  }
}

interface IProps {
  /** Label for each tick */
  timeLabels: string[];
}
/** Ticks on the timer SVG */
export class Ticks extends PureComponent<IProps> {
  /** Create the ticks */
  public render(): ReactElement {
    return (
      <>
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
              {this.props.timeLabels[i]}
            </Text>
          ))
        }
      </>
    );
  }
}
