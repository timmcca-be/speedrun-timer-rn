import React, { Component, ReactElement } from 'react';
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
interface IState {
  /** Current number of seconds as read from the input */
  time: number;
}
/** Form used to input time and start/stop timer */
export class TimeForm extends Component<IProps, IState> {
  public constructor(props: IProps) {
    super(props);
    this.state = {
      time: 0,
    };
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

  /** Component does not need to update if only the state has changed */
  public shouldComponentUpdate(nextProps: IProps): boolean {
    return nextProps.active !== this.props.active
      || nextProps.end !== this.props.end
      || nextProps.start !== this.props.start;
  }

  /**
   * Update the time in state
   * @param value New time
   */
  private readonly changeTime = (value: string): void => {
    this.setState({
      time: parseFloat(value),
    });
  }

  /** Start the timer */
  private readonly startTimer = (): void => {
    this.props.start(this.state.time);
  }
}
