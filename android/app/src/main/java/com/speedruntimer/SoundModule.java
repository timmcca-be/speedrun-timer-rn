package com.speedruntimer;

import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Build;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class SoundModule extends ReactContextBaseJavaModule {

    private class SoundRunnable implements Runnable {

        private final SoundPool sp;
        private final int soundId;
        private final int volume;

        public SoundRunnable(final SoundPool sp, final int soundId, final int volume) {
            this.sp = sp;
            this.soundId = soundId;
            this.volume = volume;
        }

        @Override
        public void run() {
            sp.play(soundId, volume, volume, 1, 0, 1);
        }

    }

    private final ReactApplicationContext reactContext;
    /** Playing a sound silently before the first real sound reduces lag */
    private final SoundRunnable silentRunnable;
    private final SoundRunnable tickRunnable;
    private final SoundRunnable dingRunnable;
    private final AudioThread thread;

    public SoundModule(final ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        final SoundPool sp;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            sp = new SoundPool.Builder()
                    .setMaxStreams(2)
                    .build();
        } else {
            sp = new SoundPool(2, AudioManager.STREAM_MUSIC, 0);
        }
        final int tickId = sp.load(reactContext, R.raw.tick, 1);
        silentRunnable = new SoundRunnable(sp, tickId, 0);
        tickRunnable = new SoundRunnable(sp, tickId, 1);
        dingRunnable = new SoundRunnable(sp, sp.load(reactContext, R.raw.ding, 1), 1);
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
        // We don't use the loop setting in SoundPool::play in case the timing is weird and the first play has lag
        for(int i = 1; i <= numTicks; i++) {
            thread.postDelayed(tickRunnable, end - i * 1000);
        }
        thread.postDelayed(silentRunnable, end - (numTicks + 1) * 1000);
    }

    @ReactMethod
    public void cancel() {
        thread.removeCallbacks(tickRunnable);
        thread.removeCallbacks(dingRunnable);
    }

}