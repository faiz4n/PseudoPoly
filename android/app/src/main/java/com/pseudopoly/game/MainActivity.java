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

    private volatile String currentRoomCode = "";
    private volatile String currentHostName = "Hotspot Host";
    private volatile int currentPlayersCount = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideSystemUI();
        setupHotspotBridge();
    }

    private String getLocalIpAddress() {
        try {
            java.util.List<java.net.NetworkInterface> interfaces = java.util.Collections.list(java.net.NetworkInterface.getNetworkInterfaces());
            for (java.net.NetworkInterface intf : interfaces) {
                if (intf.isLoopback() || !intf.isUp()) continue;
                java.util.List<java.net.InetAddress> addrs = java.util.Collections.list(intf.getInetAddresses());
                for (java.net.InetAddress addr : addrs) {
                    if (!addr.isLoopbackAddress() && addr instanceof java.net.Inet4Address) {
                        return addr.getHostAddress();
                    }
                }
            }
        } catch (Exception ignored) {}
        return "192.168.43.1";
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
                            String hostIp = getLocalIpAddress();
                            org.json.JSONObject obj = new org.json.JSONObject();
                            obj.put("id", hostIp + ":" + gamePort);
                            obj.put("roomCode", currentRoomCode);
                            obj.put("hostName", currentHostName);
                            obj.put("ip", hostIp);
                            obj.put("port", gamePort);
                            obj.put("players", currentPlayersCount);
                            obj.put("maxPlayers", 4);
                            obj.put("networkType", "hotspot");
                            obj.put("targetUrl", "http://" + hostIp + ":" + gamePort);

                            byte[] data = obj.toString().getBytes("UTF-8");
                            
                            // Broadcast to 255.255.255.255
                            java.net.DatagramPacket packet = new java.net.DatagramPacket(
                                data, data.length, java.net.InetAddress.getByName("255.255.255.255"), 3002
                            );
                            socket.send(packet);

                            // Also try directed subnet broadcast if hotspot default
                            try {
                                java.net.DatagramPacket subPacket = new java.net.DatagramPacket(
                                    data, data.length, java.net.InetAddress.getByName("192.168.43.255"), 3002
                                );
                                socket.send(subPacket);
                            } catch (Exception ignored) {}
                        } catch (Exception ignored) {}
                        Thread.sleep(1000);
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
                            String senderIp = packet.getAddress().getHostAddress();
                            String jsonStr = new String(packet.getData(), 0, packet.getLength(), "UTF-8");
                            org.json.JSONObject gameObj = new org.json.JSONObject(jsonStr);
                            
                            // Use actual physical sender IP address
                            int port = gameObj.optInt("port", 3001);
                            gameObj.put("ip", senderIp);
                            gameObj.put("targetUrl", "http://" + senderIp + ":" + port);
                            gameObj.put("id", senderIp + ":" + port);
                            
                            discoveredUdpGames.put(senderIp + ":" + port, gameObj);
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
                public void updateRoomInfo(String roomCode, String hostName, int players) {
                    if (roomCode != null && !roomCode.isEmpty()) currentRoomCode = roomCode;
                    if (hostName != null && !hostName.isEmpty()) currentHostName = hostName;
                    if (players > 0) currentPlayersCount = players;
                }

                @android.webkit.JavascriptInterface
                public boolean isServerRunning() {
                    return hotspotServer != null;
                }

                @android.webkit.JavascriptInterface
                public String getHotspotGatewayIp() {
                    try {
                        android.net.wifi.WifiManager wm = (android.net.wifi.WifiManager) getApplicationContext().getSystemService(android.content.Context.WIFI_SERVICE);
                        if (wm != null) {
                            android.net.DhcpInfo dhcp = wm.getDhcpInfo();
                            if (dhcp != null && dhcp.gateway != 0) {
                                int ip = dhcp.gateway;
                                return String.format(java.util.Locale.US, "%d.%d.%d.%d",
                                    (ip & 0xff),
                                    (ip >> 8 & 0xff),
                                    (ip >> 16 & 0xff),
                                    (ip >> 24 & 0xff));
                            }
                        }
                    } catch (Exception ignored) {}
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
