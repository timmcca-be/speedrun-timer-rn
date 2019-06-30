package com.speedruntimer;

import android.media.AudioManager;
import android.media.SoundPool;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

// TODO: implement cancelling sound
public class SoundModule extends ReactContextBaseJavaModule {

    private class SoundRunnable implements Runnable {

        private final SoundPool sp;
        private final int soundId;
        private int loops = 0;

        public SoundRunnable(final SoundPool sp, final int soundId) {
            this.sp = sp;
            this.soundId = soundId;
        }

        public void setLoops(int loops) {
            this.loops = loops;
        }

        @Override
        public void run() {
            sp.play(soundId, 1, 1, 1, loops, 1);
        }

    }

    private final ReactApplicationContext reactContext;
    private final SoundRunnable tickRunnable;
    private final SoundRunnable dingRunnable;
    private final AudioThread thread;

    public SoundModule(final ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        // TODO: use builder
        final SoundPool sp = new SoundPool(2, AudioManager.STREAM_MUSIC, 0);
        tickRunnable = new SoundRunnable(sp, sp.load(reactContext, R.raw.tick, 1));
        dingRunnable = new SoundRunnable(sp, sp.load(reactContext, R.raw.ding, 1));
        thread = new AudioThread();
        thread.start();
    }

    @Override
    public String getName() {
        return "SoundPlayer";
    }

    @ReactMethod
    public void play(final Double endTime, final Integer maxTicks) {
        final long end = endTime.longValue() - System.currentTimeMillis();
        thread.postDelayed(dingRunnable, end);
        int numTicks = (int) (end / 1000);
        if (maxTicks < numTicks) {
            numTicks = maxTicks;
        }
        tickRunnable.setLoops(numTicks - 1);
        thread.postDelayed(tickRunnable, end - numTicks * 1000);
    }

}