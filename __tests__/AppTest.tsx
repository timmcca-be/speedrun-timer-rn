/**
 * @format
 */

import React from 'react';
// Not my library, not my monkeys
// tslint:disable-next-line:no-import-side-effect
import 'react-native';
import renderer from 'react-test-renderer';

import { App } from '../App';

// Note: test renderer must be required after react-native.

it('renders correctly', () => {
  renderer.create(<App />);
});
