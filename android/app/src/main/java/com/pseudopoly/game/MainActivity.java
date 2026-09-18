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
    private Thread udpBeaconThread = null;
    private volatile boolean isBroadcastingBeacon = false;
    private Thread udpListenerThread = null;
    private volatile boolean isListeningUdp = false;
    private final java.util.Map<String, org.json.JSONObject> discoveredUdpGames = new java.util.concurrent.ConcurrentHashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideSystemUI();
        setupHotspotBridge();
    }

    private void startUdpBeacon(final int gamePort) {
        stopUdpBeacon();
        isBroadcastingBeacon = true;
        udpBeaconThread = new Thread(new Runnable() {
            @Override
            public void run() {
                java.net.DatagramSocket socket = null;
                try {
                    socket = new java.net.DatagramSocket();
                    socket.setBroadcast(true);
                    while (isBroadcastingBeacon) {
                        try {
                            org.json.JSONObject obj = new org.json.JSONObject();
                            obj.put("id", "192.168.43.1:" + gamePort);
                            obj.put("hostName", "Hotspot Host");
                            obj.put("ip", "192.168.43.1");
                            obj.put("port", gamePort);
                            obj.put("players", 1);
                            obj.put("maxPlayers", 4);
                            obj.put("networkType", "hotspot");
                            obj.put("targetUrl", "http://192.168.43.1:" + gamePort);

                            byte[] data = obj.toString().getBytes("UTF-8");
                            java.net.DatagramPacket packet = new java.net.DatagramPacket(
                                data, data.length, java.net.InetAddress.getByName("255.255.255.255"), 3002
                            );
                            socket.send(packet);
                        } catch (Exception ignored) {}
                        Thread.sleep(1200);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    if (socket != null && !socket.isClosed()) socket.close();
                }
            }
        });
        udpBeaconThread.setDaemon(true);
        udpBeaconThread.start();
    }

    private void stopUdpBeacon() {
        isBroadcastingBeacon = false;
        if (udpBeaconThread != null) {
            try { udpBeaconThread.interrupt(); } catch (Exception ignored) {}
            udpBeaconThread = null;
        }
    }

    private void startUdpListener() {
        if (isListeningUdp) return;
        isListeningUdp = true;
        discoveredUdpGames.clear();
        udpListenerThread = new Thread(new Runnable() {
            @Override
            public void run() {
                java.net.DatagramSocket socket = null;
                try {
                    socket = new java.net.DatagramSocket(3002);
                    socket.setBroadcast(true);
                    byte[] buf = new byte[2048];
                    while (isListeningUdp) {
                        try {
                            java.net.DatagramPacket packet = new java.net.DatagramPacket(buf, buf.length);
                            socket.receive(packet);
                            String jsonStr = new String(packet.getData(), 0, packet.getLength(), "UTF-8");
                            org.json.JSONObject gameObj = new org.json.JSONObject(jsonStr);
                            String id = gameObj.optString("id");
                            if (!id.isEmpty()) {
                                discoveredUdpGames.put(id, gameObj);
                            }
                        } catch (Exception ignored) {}
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    if (socket != null && !socket.isClosed()) socket.close();
                }
            }
        });
        udpListenerThread.setDaemon(true);
        udpListenerThread.start();
    }

    private void stopUdpListenerInternal() {
        isListeningUdp = false;
        if (udpListenerThread != null) {
            try { udpListenerThread.interrupt(); } catch (Exception ignored) {}
            udpListenerThread = null;
        }
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
                        int targetPort = port > 0 ? port : 3001;
                        hotspotServer = new HotspotGameServer(targetPort);
                        hotspotServer.start();
                        startUdpBeacon(targetPort);
                        return true;
                    } catch (Exception e) {
                        e.printStackTrace();
                        return false;
                    }
                }

                @android.webkit.JavascriptInterface
                public boolean stopHotspotServer() {
                    try {
                        stopUdpBeacon();
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

                @android.webkit.JavascriptInterface
                public String getDiscoveredUdpGames() {
                    startUdpListener();
                    org.json.JSONArray arr = new org.json.JSONArray();
                    for (org.json.JSONObject obj : discoveredUdpGames.values()) {
                        arr.put(obj);
                    }
                    return arr.toString();
                }

                @android.webkit.JavascriptInterface
                public void stopUdpListener() {
                    stopUdpListenerInternal();
                }
            }, "AndroidHostServer");
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopUdpBeacon();
        stopUdpListenerInternal();
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
