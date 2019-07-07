export interface ISoundPlayer {
    /** Cancel all pending sounds */
    cancel(): void;
    /**
     * Play numTicks ticks, one every second ending a second before
     * the timer ends, then play a ding when the timer ends.
     */
    play(endTime: number, numTicks: number): void;
}
