package com.pseudopoly.game;

import android.util.Log;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;
import org.json.JSONArray;
import org.json.JSONObject;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class HotspotGameServer extends WebSocketServer {
    private static final String TAG = "HotspotGameServer";

    public static class Player {
        public int id;
        public String name;
        public String avatar;
        public WebSocket conn;
        public boolean isHost;
        public boolean connected;
        public boolean isReady = false;

        public Player(int id, String name, String avatar, WebSocket conn, boolean isHost) {
            this.id = id;
            this.name = name;
            this.avatar = avatar;
            this.conn = conn;
            this.isHost = isHost;
            this.connected = true;
            this.isReady = isHost; // Host is ready by default
        }

        public JSONObject toJson() {
            try {
                JSONObject json = new JSONObject();
                json.put("id", id);
                json.put("name", name);
                json.put("avatar", avatar);
                json.put("isHost", isHost);
                json.put("connected", connected);
                json.put("isReady", isReady);
                return json;
            } catch (Exception e) {
                return new JSONObject();
            }
        }
    }

    public static class GameRoom {
        public String roomCode;
        public List<Player> players = new ArrayList<>();
        public JSONObject gameState = new JSONObject();

        public GameRoom(String roomCode) {
            this.roomCode = roomCode;
        }

        public JSONArray getPlayersJson() {
            JSONArray arr = new JSONArray();
            for (Player p : players) {
                arr.put(p.toJson());
            }
            return arr;
        }
    }

    private final Map<String, GameRoom> rooms = new ConcurrentHashMap<>();
    private final Map<WebSocket, String> connectionRoomMap = new ConcurrentHashMap<>();
    private final Map<WebSocket, Integer> connectionPlayerMap = new ConcurrentHashMap<>();

    public HotspotGameServer(int port) {
        super(new InetSocketAddress(port));
        setReuseAddr(true);
        setTcpNoDelay(true);
    }

    @Override
    public void onStart() {
        Log.i(TAG, "Hotspot Game Server started on port " + getPort());
    }

    @Override
    public void onOpen(WebSocket conn, ClientHandshake handshake) {
        Log.i(TAG, "Client connected: " + conn.getRemoteSocketAddress());
        // Send Engine.IO v4 open handshake packet
        String sid = UUID.randomUUID().toString();
        conn.send("0{\"sid\":\"" + sid + "\",\"upgrades\":[],\"pingInterval\":25000,\"pingTimeout\":20000,\"maxPayload\":1000000}");
    }

    @Override
    public void onClose(WebSocket conn, int code, String reason, boolean remote) {
        Log.i(TAG, "Client disconnected: " + conn.getRemoteSocketAddress() + " code=" + code);
        String roomCode = connectionRoomMap.remove(conn);
        Integer playerIndex = connectionPlayerMap.remove(conn);

        if (roomCode != null && rooms.containsKey(roomCode)) {
            GameRoom room = rooms.get(roomCode);
            if (room != null && playerIndex != null && playerIndex < room.players.size()) {
                Player p = room.players.get(playerIndex);
                p.connected = false;
                p.conn = null;
                broadcastToRoom(room, "42[\"players_updated\",{\"players\":" + room.getPlayersJson().toString() + "}]", null);
            }
        }
    }

    @Override
    public void onMessage(WebSocket conn, String message) {
        if (message == null || message.isEmpty()) return;

        // Engine.IO Heartbeat Ping -> Pong
        if (message.equals("2")) {
            conn.send("3");
            return;
        }

        // Engine.IO Namespace Connect
        if (message.startsWith("40")) {
            conn.send("40{\"sid\":\"" + UUID.randomUUID().toString() + "\"}");
            return;
        }

        // Socket.IO Event Packet: 42["event", data]
        if (message.startsWith("42")) {
            try {
                String payload = message.substring(2);
                JSONArray array = new JSONArray(payload);
                String event = array.getString(0);
                JSONObject data = array.length() > 1 && !array.isNull(1) ? array.optJSONObject(1) : new JSONObject();
                handleEvent(conn, event, data);
            } catch (Exception e) {
                Log.e(TAG, "Error parsing event: " + e.getMessage());
            }
        }
    }

    @Override
    public void onError(WebSocket conn, Exception ex) {
        Log.e(TAG, "WebSocket error: " + ex.getMessage());
    }

    private void handleEvent(WebSocket conn, String event, JSONObject data) {
        try {
            switch (event) {
                case "create_room": {
                    String name = data.optString("name", "Host");
                    String avatar = data.optString("avatar", "");

                    String roomCode;
                    do {
                        roomCode = String.valueOf(1000 + new Random().nextInt(9000));
                    } while (rooms.containsKey(roomCode));

                    GameRoom room = new GameRoom(roomCode);
                    Player host = new Player(0, name, avatar, conn, true);
                    room.players.add(host);
                    rooms.put(roomCode, room);

                    connectionRoomMap.put(conn, roomCode);
                    connectionPlayerMap.put(conn, 0);

                    JSONObject res = new JSONObject();
                    res.put("roomCode", roomCode);
                    res.put("playerIndex", 0);
                    res.put("gameState", room.gameState);
                    res.put("players", room.getPlayersJson());

                    conn.send("42[\"room_created\"," + res.toString() + "]");
                    conn.send("42[\"players_updated\",{\"players\":" + room.getPlayersJson().toString() + "}]");
                    Log.i(TAG, "Created room: " + roomCode + " for host: " + name);
                    break;
                }

                case "query_info": {
                    // Return info of active room for LAN/Hotspot discovery
                    if (!rooms.isEmpty()) {
                        GameRoom room = rooms.values().iterator().next();
                        JSONObject info = new JSONObject();
                        info.put("roomCode", room.roomCode);
                        info.put("hostName", room.players.isEmpty() ? "Host" : room.players.get(0).name);
                        info.put("players", room.players.size());
                        info.put("maxPlayers", 4);
                        info.put("status", "lobby");
                        conn.send("42[\"room_info\"," + info.toString() + "]");
                    } else {
                        JSONObject info = new JSONObject();
                        info.put("roomCode", "");
                        info.put("hostName", "Ready to Host");
                        info.put("players", 0);
                        info.put("maxPlayers", 4);
                        info.put("status", "open");
                        conn.send("42[\"room_info\"," + info.toString() + "]");
                    }
                    break;
                }

                case "toggle_ready": {
                    String roomCode = connectionRoomMap.get(conn);
                    Integer playerIndex = connectionPlayerMap.get(conn);
                    if (roomCode != null && rooms.containsKey(roomCode) && playerIndex != null) {
                        GameRoom room = rooms.get(roomCode);
                        if (room != null && playerIndex < room.players.size()) {
                            Player p = room.players.get(playerIndex);
                            if (!p.isHost) {
                                p.isReady = !p.isReady;
                                broadcastToRoom(room, "42[\"players_updated\",{\"players\":" + room.getPlayersJson().toString() + "}]", null);
                                Log.i(TAG, "Player " + p.name + " ready state: " + p.isReady);
                            }
                        }
                    }
                    break;
                }

                case "join_room": {
                    String roomCode = String.valueOf(data.opt("roomCode")).trim();
                    if (roomCode.isEmpty() || roomCode.equals("null") || roomCode.equals("undefined")) {
                        // Auto-select first active room if no code passed (Mini Militia 1-tap join)
                        if (!rooms.isEmpty()) {
                            roomCode = rooms.keySet().iterator().next();
                        }
                    }
                    String name = data.optString("name", "Player");
                    String avatar = data.optString("avatar", "");

                    GameRoom room = rooms.get(roomCode);
                    if (room == null) {
                        conn.send("42[\"error\",{\"message\":\"Room " + roomCode + " not found!\"}]");
                        return;
                    }

                    if (room.players.size() >= 4) {
                        conn.send("42[\"error\",{\"message\":\"Room is full (max 4 players)\"}]");
                        return;
                    }

                    int playerIndex = room.players.size();
                    Player player = new Player(playerIndex, name, avatar, conn, false);
                    room.players.add(player);

                    connectionRoomMap.put(conn, roomCode);
                    connectionPlayerMap.put(conn, playerIndex);

                    JSONObject joinRes = new JSONObject();
                    joinRes.put("roomCode", roomCode);
                    joinRes.put("playerIndex", playerIndex);
                    joinRes.put("gameState", room.gameState);
                    joinRes.put("players", room.getPlayersJson());

                    conn.send("42[\"joined_room\"," + joinRes.toString() + "]");
                    broadcastToRoom(room, "42[\"players_updated\",{\"players\":" + room.getPlayersJson().toString() + "}]", null);
                    Log.i(TAG, "Player " + name + " joined room " + roomCode + " as P" + playerIndex);
                    break;
                }

                case "start_game": {
                    String roomCode = connectionRoomMap.get(conn);
                    if (roomCode != null && rooms.containsKey(roomCode)) {
                        GameRoom room = rooms.get(roomCode);
                        broadcastToRoom(room, "42[\"state_update\",{\"gameStage\":\"playing\"}]", null);
                    }
                    break;
                }

                case "game_action": {
                    String roomCode = connectionRoomMap.get(conn);
                    if (roomCode != null && rooms.containsKey(roomCode)) {
                        GameRoom room = rooms.get(roomCode);
                        String action = data.optString("action");
                        JSONObject payload = data.optJSONObject("payload");
                        if (payload == null) payload = new JSONObject();

                        JSONObject broadcastObj = new JSONObject();
                        broadcastObj.put("action", action);
                        broadcastObj.put("payload", payload);

                        // Broadcast action to all other players in the room
                        broadcastToRoom(room, "42[\"game_action\"," + broadcastObj.toString() + "]", conn);

                        // If state update is provided, relay to all clients
                        if (payload.has("playerMoney") || payload.has("playerPositions") || payload.has("propertyOwnership")) {
                            broadcastToRoom(room, "42[\"state_update\"," + payload.toString() + "]", null);
                        }
                    }
                    break;
                }

                case "update_state": {
                    String roomCode = connectionRoomMap.get(conn);
                    if (roomCode != null && rooms.containsKey(roomCode)) {
                        GameRoom room = rooms.get(roomCode);
                        broadcastToRoom(room, "42[\"state_update\"," + data.toString() + "]", null);
                    }
                    break;
                }

                case "roll_dice_anim": {
                    String roomCode = connectionRoomMap.get(conn);
                    if (roomCode != null && rooms.containsKey(roomCode)) {
                        GameRoom room = rooms.get(roomCode);
                        broadcastToRoom(room, "42[\"roll_dice_anim\"," + data.toString() + "]", conn);
                    }
                    break;
                }

                case "chance_move_animated": {
                    String roomCode = connectionRoomMap.get(conn);
                    if (roomCode != null && rooms.containsKey(roomCode)) {
                        GameRoom room = rooms.get(roomCode);
                        broadcastToRoom(room, "42[\"chance_move_animated\"," + data.toString() + "]", null);
                    }
                    break;
                }

                case "landed": {
                    String roomCode = connectionRoomMap.get(conn);
                    if (roomCode != null && rooms.containsKey(roomCode)) {
                        GameRoom room = rooms.get(roomCode);
                        broadcastToRoom(room, "42[\"landed\",{}]", conn);
                    }
                    break;
                }

                default: {
                    String roomCode = connectionRoomMap.get(conn);
                    if (roomCode != null && rooms.containsKey(roomCode)) {
                        GameRoom room = rooms.get(roomCode);
                        broadcastToRoom(room, "42[\"" + event + "\"," + data.toString() + "]", conn);
                    }
                    break;
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error handling event " + event + ": " + e.getMessage());
        }
    }

    private void broadcastToRoom(GameRoom room, String rawMessage, WebSocket excludeConn) {
        if (room == null || room.players == null) return;
        for (Player p : room.players) {
            if (p.conn != null && p.conn.isOpen() && (excludeConn == null || p.conn != excludeConn)) {
                try {
                    p.conn.send(rawMessage);
                } catch (Exception e) {
                    Log.e(TAG, "Error sending to player " + p.id + ": " + e.getMessage());
                }
            }
        }
    }
}
