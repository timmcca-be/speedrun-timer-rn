// It's an SVG. How can it not have "magic numbers"?
/* tslint:disable:no-magic-numbers */

import React, { PureComponent, ReactElement } from 'react';
import { Line, Path } from 'react-native-svg';

import * as Colors from '../common/Colors';

interface IProps {
  /** Current angle, in degrees */
  angle: number;
  /** Parent SVG width/height in pixels */
  size: number;
}
/** The animated components of the timer SVG */
export class StaticTimerCenter extends PureComponent<IProps> {
  /** Create and return the animated part of the timer SVG */
  public render(): ReactElement {
    const cos = Math.cos(this.props.angle);
    const sin = Math.sin(this.props.angle);

    return (
      <>
        <Path
          d={`M 0 0 L 0 -31 A 31 31 0 ${this.props.angle > Math.PI ? '1' : '0'} 1 ${sin * 31} ${-cos * 31}`}
          fill={Colors.RED} />
        <Line
          x1={0} y1={0}
          x2={sin * 32.3} y2={-cos * 32.3}
          stroke={Colors.RED}
          strokeWidth={1.7}
          strokeLinecap="round" />
      </>
    );
  }
}
