// TypeScript doesn't work with React Native platform-specific file extensions, so we use this workaround:
// https://github.com/microsoft/TypeScript/issues/8328#issuecomment-219583152

import * as android from './SoundPlayer.android'; 
import * as other from './SoundPlayer'; 

// Compile time check that the android version and the version for other platforms are the same type
declare var _test: typeof android;
declare var _test: typeof other;

// Export here so that the importing file can see the type
// This is only for the TypeScript build process - React Native will import the correct file automatically
export { SoundPlayer } from './SoundPlayer'; 