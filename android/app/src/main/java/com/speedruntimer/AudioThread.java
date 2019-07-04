package com.speedruntimer;

import android.os.Handler;
import android.os.Looper;

public class AudioThread extends Thread {

    private Handler handler;

    @Override
    public void run() {
        Looper.prepare();
        handler = new Handler();
        Looper.loop();
    }

    public void postDelayed(Runnable r, long delayMillis) {
        handler.postDelayed(r, delayMillis);
    }

    public void removeCallbacks(Runnable r) {
        handler.removeCallbacks(r);
    }

}