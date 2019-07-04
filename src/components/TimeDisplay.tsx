// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import memoizeOne from 'memoize-one';
import React, { Component, ReactElement } from 'react';
import { Text } from 'react-native-svg';

import * as Colors from '../common/Colors';
import * as SecondsPer from '../common/SecondsPer';

interface IProps {
  /** Number of seconds to display */
  seconds: number;
}
/** Form used to input time and start/stop timer */
export class TimeDisplay extends Component<IProps> {
  /**
   * Format time to go in timer, memoized to store the last output
   * @param seconds Number of seconds remaining
   */
  private readonly getFormattedTime = memoizeOne((seconds: number): string => {
    if (seconds === 0) {
      return '';
    } if (seconds <= SecondsPer.MIN) {
      return seconds.toString();
    }

    let smallUnit: number;
    let bigUnit: number;
    let bigUnitText: string;
    if (seconds <= SecondsPer.HOUR) {
      smallUnit = 1;
      bigUnit = SecondsPer.MIN;
      bigUnitText = 'm';
    } else if (seconds <= SecondsPer.DAY) {
      smallUnit = SecondsPer.MIN;
      bigUnit = SecondsPer.HOUR;
      bigUnitText = 'h';
    } else {
      smallUnit = SecondsPer.HOUR;
      bigUnit = SecondsPer.DAY;
      bigUnitText = 'd';
    }

    const bigUnitAmount = seconds / bigUnit;
    // 10 is used because it's the smallest two-digit number
    // tslint:disable-next-line:no-magic-numbers
    if (bigUnitAmount >= 10) {
      return `${Math.ceil(bigUnitAmount)}${bigUnitText}`;
    }

    return `${Math.floor(bigUnitAmount)}${bigUnitText}${Math.ceil((seconds % bigUnit) / smallUnit)}`;
  });

  public constructor(props: IProps) {
    super(props);
  }

  /** Create and return time entry form */
  public render(): ReactElement {
    const timeText = this.getFormattedTime(Math.ceil(this.props.seconds));

    return (
      <Text
        x={0} y={timeText.length > 2 ? 2.2 : 3.2}
        textAnchor="middle"
        fontFamily="BetecknaLowerCase"
        fill={Colors.BLACK}
        fontSize={timeText.length > 2 ? 7 : 9}>
       {timeText}
      </Text>
    );
  }

  /** Only update if the time displayed should be different */
  public shouldComponentUpdate(nextProps: IProps): boolean {
    const seconds = Math.ceil(this.props.seconds);
    const nextSeconds = Math.ceil(nextProps.seconds);

    return seconds !== nextSeconds
        // Reminder that the order here is critical - flipping these will remove the memoization benefits
        && this.getFormattedTime(seconds) !== this.getFormattedTime(nextSeconds);
  }
}
