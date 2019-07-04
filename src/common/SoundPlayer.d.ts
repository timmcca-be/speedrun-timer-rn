// https://github.com/microsoft/TypeScript/issues/8328#issuecomment-219583152
import * as ios from "./SoundPlayer.ios"; 
import * as android from "./SoundPlayer.ios"; 

// Compile time check that the ios and android versions are the same types
declare var _test: typeof ios;
declare var _test: typeof android;

// Export here so that the importing file can see the type
export { SoundPlayer } from "./SoundPlayer.ios"; 