export interface ISoundPlayer {
    /** Play ding */
    playDing(): void;
    /** Play numTicks ticks, one every second */
    playTick(): void;
    /** Play a sound silently to reduce lag on first play */
    prepare(): void;
}
