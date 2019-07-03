package com.speedruntimer;

import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Build;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

// TODO: implement cancelling sound
public class SoundModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private final SoundPool sp;
    private final int tickId;
    private final int dingId;

    public SoundModule(final ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            sp = new SoundPool.Builder()
                    .setMaxStreams(1)
                    .build();
        } else {
            sp = new SoundPool(1, AudioManager.STREAM_MUSIC, 0);
        }

        tickId = sp.load(reactContext, R.raw.tick, 1);
        dingId = sp.load(reactContext, R.raw.ding, 1);
    }

    @Override
    public String getName() {
        return "SoundPlayer";
    }

    @ReactMethod
    public void playTick() {
        sp.play(tickId, 1, 1, 1, 0, 1);
    }

    @ReactMethod
    public void playDing() {
        sp.play(dingId, 1, 1, 1, 0, 1);
    }

    @ReactMethod
    public void prepare() {
        sp.play(dingId, 0, 0, 1, 0, 1);
    }

}