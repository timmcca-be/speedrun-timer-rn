import React, { PureComponent, ReactElement, SyntheticEvent } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import * as Colors from '../common/Colors';
import * as MillisPer from '../common/MillisPer';

import { KeypadButton } from './KeypadButton';

const NUM_MILLI_DIGITS = 3;
const MINUTE_INDEX = 2;
const SECOND_INDEX = 4;

// tslint:disable-next-line:no-magic-numbers
const KEYPAD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface IProps {
  /** Timer is currently counting down */
  active: boolean;
  /** Function to end timer when stop button is clicked */
  halt(): void;
  /**
   * Start the timer
   * @param endTime Time at which timer should end
   */
  start(endTime: number): void;
}
interface IState {
  /** True if we are after the decimal point */
  inputtingMillis: boolean;
  /** Inputted milliseconds, as text */
  millis: string;
  /** Inputted time, as text padded with zeros */
  time: string;
}
/** Form used to input time and start/stop timer */
export class TimeForm extends PureComponent<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    this.state = {
      inputtingMillis: false,
      millis: '',
      time: '000000',
    };
  }

  /** Create and return time entry form */
  public render(): ReactElement {
    return (
      <View style={{
          alignItems: 'center',
        }}>
        {
          // TODO: color code input display so it's clear where the "cursor" is
          this.props.active ? undefined : (<>
            <Text style={{
                fontFamily: 'BetecknaLowerCase',
                fontSize: 36,
                marginBottom: 16,
                textAlign: 'center',
              }}>
              {`${
                this.getHoursString()
              }h ${
                this.getMinutesString()
              }m ${
                this.getSecondsString()
              }.${
                this.getMillisString()
              }s`}
            </Text>
            <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
              {
                KEYPAD_NUMBERS.map((num: number) =>
                  <KeypadButton key={num}
                    text={num.toString()}
                    onPress={(): void => { this.addNum(num); }} />,
                )
              }
              <KeypadButton text="." onPress={this.switchToMillis} />
              <KeypadButton text="0"
                onPress={(): void => { this.addNum(0); }} />
              <KeypadButton text="⌫" onPress={this.backspace} />
            </View>
          </>)
        }
        <TouchableOpacity
          onPress={this.props.active ? this.props.halt : this.startTimer}
          style={{
            backgroundColor: Colors.RED,
            borderRadius: 35,
            height: 70,
            justifyContent: 'center',
            width: 70,
          }}>
          <Text style={{
              color: Colors.WHITE,
              fontFamily: 'BetecknaLowerCase',
              fontSize: 20,
              marginBottom: 5,
              textAlign: 'center',
            }}>
            {this.props.active ? 'Stop' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Add a character to the stored time
   * @param num New digit
   */
  private addNum(num: number): void {
    if (this.state.inputtingMillis) {
      if (this.state.millis.length >= NUM_MILLI_DIGITS) {
        return;
      }
      this.setState({
        millis: `${this.state.millis}${num}`,
      });
    } else {
      if (this.state.time[0] !== '0'
        || (this.state.time.length === 0 && num === 0)) {
        return;
      }
      this.setState({
        time: `${this.state.time.slice(1)}${num}`,
      });
    }
  }

  /** Delete the last character */
  private readonly backspace = (): void => {
    if (this.state.inputtingMillis) {
      if (this.state.millis.length === 0) {
        this.setState({
          inputtingMillis: false,
        });
      } else {
        this.setState({
          millis: this.state.millis.slice(0, -1),
        });
      }
    } else {
      this.setState({
        time: `0${this.state.time.slice(0, -1)}`,
      });
    }
  }

  /** Get hours as string */
  private getHoursString(): string {
    return this.state.time.slice(0, MINUTE_INDEX);
  }

  /** Get minutes as string */
  private getMinutesString(): string {
    return this.state.time.slice(MINUTE_INDEX, SECOND_INDEX);
  }

  /** Get minutes as string */
  private getSecondsString(): string {
    return this.state.time.slice(SECOND_INDEX);
  }

  /** Get number of milliseconds inputted with zeros appended */
  // tslint:disable-next-line:member-ordering
  private getMillisString(): string {
    let millis = this.state.millis;
    for (let i = millis.length; i < NUM_MILLI_DIGITS; i += 1) {
      millis += '0';
    }

    return millis;
  }

  /**
   * Start the timer
   * @param e Button press event
   */
  private readonly startTimer = (e: SyntheticEvent): void => {
    const hours = parseInt(this.getHoursString(), 10) * MillisPer.HOUR;
    const minutes = parseInt(this.getMinutesString(), 10) * MillisPer.MIN;
    const seconds = parseInt(this.getSecondsString(), 10) * MillisPer.SEC;
    const millis = parseInt(this.getMillisString(), 10);
    this.props.start(e.timeStamp + hours + minutes + seconds + millis);
  }

  /** Start adding milliseconds */
  private readonly switchToMillis = (): void => {
    this.setState({
      inputtingMillis: true,
    });
  }
}
