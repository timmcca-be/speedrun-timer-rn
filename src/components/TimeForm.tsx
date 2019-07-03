import React, { PureComponent, ReactElement } from 'react';
import { Button, TextInput, View } from 'react-native';

interface IProps {
  /** Timer is currently counting down */
  active: boolean;
  /** Function to end timer when stop button is clicked */
  end(): void;
  /**
   * Function to start timer when start button is clicked
   * @param seconds Number of seconds as read from the input
   */
  start(seconds: number): void;
}
/** Form used to input time and start/stop timer */
export class TimeForm extends PureComponent<IProps> {
  /** Current time in text box */
  private time = 0;

  public constructor(props: IProps) {
    super(props);
  }

  /** Create and return time entry form */
  public render(): ReactElement {
    return (
      <View>
        <TextInput keyboardType="numeric" onChangeText={this.changeTime} />
        <Button
          title={this.props.active ? 'Stop' : 'Start'}
          onPress={this.props.active ? this.props.end : this.startTimer} />
      </View>
    );
  }

  /**
   * Update the stored time
   * @param value New time
   */
  private readonly changeTime = (value: string): void => {
    this.time = parseFloat(value);
  }

  /** Start the timer */
  private readonly startTimer = (): void => {
    this.props.start(this.time);
  }
}
