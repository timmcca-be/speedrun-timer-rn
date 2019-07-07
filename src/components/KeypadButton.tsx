import React, { PureComponent, ReactElement } from 'react';
import { GestureResponderEvent, Text, TouchableOpacity } from 'react-native';

import * as Colors from '../common/Colors';

interface IProps {
  /** Function to fire when the button is pressed */
  // Using arrow function type eliminates confusion with 'this'
  // tslint:disable-next-line:prefer-method-signature
  onPress: (event: GestureResponderEvent) => void;
  /** Text to go in button */
  text: string;
}

/** Button for keypad on TimeForm */
export class KeypadButton extends PureComponent<IProps> {
  /** Create the button */
  public render(): ReactElement {
    return (
      <TouchableOpacity onPress={this.props.onPress}
        style={{
          backgroundColor: Colors.BLACK,
          borderRadius: 10,
          height: 50,
          justifyContent: 'center',
          margin: '1%',
          width: '27%',
        }}>
        <Text style={{
            color: Colors.WHITE,
            fontFamily: 'BetecknaLowerCase',
            fontSize: 20,
            marginBottom: 5,
            textAlign: 'center',
          }}>{this.props.text}</Text>
      </TouchableOpacity>
    );
  }
}
