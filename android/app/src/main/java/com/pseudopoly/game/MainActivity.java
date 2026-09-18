package com.pseudopoly.game;

import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private HotspotGameServer hotspotServer = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideSystemUI();
        setupHotspotBridge();
    }

    private void setupHotspotBridge() {
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().addJavascriptInterface(new Object() {
                @android.webkit.JavascriptInterface
                public boolean startHotspotServer(int port) {
                    try {
                        if (hotspotServer != null) {
                            try { hotspotServer.stop(); } catch (Exception ignored) {}
                        }
                        hotspotServer = new HotspotGameServer(port > 0 ? port : 3001);
                        hotspotServer.start();
                        return true;
                    } catch (Exception e) {
                        e.printStackTrace();
                        return false;
                    }
                }

                @android.webkit.JavascriptInterface
                public boolean stopHotspotServer() {
                    try {
                        if (hotspotServer != null) {
                            hotspotServer.stop();
                            hotspotServer = null;
                        }
                        return true;
                    } catch (Exception e) {
                        return false;
                    }
                }

                @android.webkit.JavascriptInterface
                public boolean isServerRunning() {
                    return hotspotServer != null;
                }

                @android.webkit.JavascriptInterface
                public String getHotspotGatewayIp() {
                    return "192.168.43.1";
                }
            }, "AndroidHostServer");
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (hotspotServer != null) {
            try {
                hotspotServer.stop();
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    private void hideSystemUI() {
        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.hide(WindowInsetsCompat.Type.systemBars());
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        }
    }
}
