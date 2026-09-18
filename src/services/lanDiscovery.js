/**
 * lanDiscovery.js - Local Area Network (Wi-Fi / Hotspot) Game Discovery Service
 * 
 * Conceptually mimics classic Mini Militia LAN discovery:
 * - Scans Android hotspot gateway (192.168.43.1:3001) and local subnets.
 * - Bridges to native Android UDP broadcast listener if available.
 * - Detects active Pseudo Poly game rooms automatically.
 * - Yields discovered games to the UI without requiring manual IP entry or room codes.
 */

class LanDiscoveryService {
  constructor() {
    this.isScanning = false;
    this.scanInterval = null;
    this.discoveredGames = new Map();
    this.onGameFoundCallback = null;
    this.onStatusCallback = null;
  }

  /**
   * Start scanning for nearby game rooms
   * @param {Function} onGameFound - called whenever a game is found/updated
   * @param {Function} onStatus - called with scanning status updates
   */
  startScan(onGameFound, onStatus) {
    this.stopScan();
    this.isScanning = true;
    this.discoveredGames.clear();
    this.onGameFoundCallback = onGameFound;
    this.onStatusCallback = onStatus;

    if (this.onStatusCallback) {
      this.onStatusCallback('Searching for nearby games...');
    }

    // Run immediate scan cycle
    this.runScanCycle();

    // Repeat scan probe every 3.5 seconds while active
    this.scanInterval = setInterval(() => {
      if (this.isScanning) {
        this.runScanCycle();
      }
    }, 3500);
  }

  /**
   * Stop scanning
   */
  stopScan() {
    this.isScanning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (typeof window !== 'undefined' && window.AndroidHostServer?.stopUdpListener) {
      try {
        window.AndroidHostServer.stopUdpListener();
      } catch (e) {
        console.warn('[lanDiscovery] stopUdpListener error:', e);
      }
    }
  }

  /**
   * Execute a single round of probing
   */
  async runScanCycle() {
    // 1. Query Android Native UDP Listener if available
    if (typeof window !== 'undefined' && window.AndroidHostServer?.getDiscoveredUdpGames) {
      try {
        const rawJson = window.AndroidHostServer.getDiscoveredUdpGames();
        if (rawJson) {
          const list = JSON.parse(rawJson);
          if (Array.isArray(list)) {
            list.forEach(game => this.registerDiscoveredGame(game));
          }
        }
      } catch (e) {
        console.warn('[lanDiscovery] Native UDP discovery parse error:', e);
      }
    }

    // 2. Candidate targets to probe
    const candidateHosts = [];

    // On Android, check the DHCP Hotspot/WiFi gateway IP
    if (typeof window !== 'undefined' && window.AndroidHostServer?.getHotspotGatewayIp) {
      try {
        const gw = window.AndroidHostServer.getHotspotGatewayIp();
        if (gw) candidateHosts.push(`${gw}:3001`);
      } catch (e) {}
    }
    
    // Always include the default Android hotspot gateway
    if (!candidateHosts.includes('192.168.43.1:3001')) {
      candidateHosts.push('192.168.43.1:3001');
    }

    // If running in a browser or desktop, probe current host and localhost
    if (typeof window !== 'undefined' && window.location?.hostname) {
      const h = window.location.hostname;
      if (h && h !== 'localhost' && h !== '127.0.0.1' && !candidateHosts.includes(`${h}:3001`)) {
        candidateHosts.push(`${h}:3001`);
      }
    }
    // Only probe localhost if not on native Android app or for debugging
    if (typeof window === 'undefined' || !window.AndroidHostServer) {
      if (!candidateHosts.includes('localhost:3001')) {
        candidateHosts.push('localhost:3001');
      }
    }

    // Add any previously configured host from localStorage
    try {
      const savedHost = localStorage.getItem('pseudopoly_server_url');
      if (savedHost) {
        const clean = savedHost.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
        if (!candidateHosts.includes(clean)) {
          candidateHosts.push(clean);
        }
      }
    } catch {}

    // Clean any games not seen in the last 4.5 seconds
    this.cleanStaleGames();

    // Probe candidate targets concurrently
    await Promise.all(candidateHosts.map(target => this.probeTarget(target)));
    this.cleanStaleGames();
  }

  /**
   * Remove games that haven't been detected in the last 4.5 seconds
   */
  cleanStaleGames() {
    const now = Date.now();
    let changed = false;
    for (const [id, game] of this.discoveredGames.entries()) {
      if (now - (game.lastSeen || 0) > 4500) {
        this.discoveredGames.delete(id);
        changed = true;
      }
    }
    if (changed && this.onGameFoundCallback) {
      this.onGameFoundCallback(Array.from(this.discoveredGames.values()));
    }
  }

  /**
   * Probe a specific target address via quick WebSocket handshake
   */
  probeTarget(targetAddress) {
    return new Promise((resolve) => {
      const cleanAddr = targetAddress.replace(/^https?:\/\//, '').replace(/^wss?:\/\//, '');
      const wsUrl = `ws://${cleanAddr}/socket.io/?EIO=4&transport=websocket`;

      let socket;
      const startTime = Date.now();
      let resolved = false;

      const finish = () => {
        if (!resolved) {
          resolved = true;
          try {
            if (socket) {
              socket.onmessage = null;
              socket.onerror = null;
              socket.onclose = null;
              if (socket.readyState === WebSocket.OPEN) {
                try { socket.close(); } catch {}
              } else if (socket.readyState === WebSocket.CONNECTING) {
                socket.onopen = () => { try { socket.close(); } catch {} };
              }
            }
          } catch {}
          resolve();
        }
      };

      const timer = setTimeout(finish, 2000);

      try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          try {
            socket.send('40'); // Connect to default namespace
            socket.send('42["query_info",{}]');
          } catch {}
        };

        socket.onmessage = (event) => {
          const latency = Date.now() - startTime;
          const msg = event.data;

          if (typeof msg === 'string') {
            // Check for room info packet: 42["room_info", {...}]
            if (msg.startsWith('42')) {
              try {
                const parsed = JSON.parse(msg.substring(2));
                if (parsed[0] === 'room_info' && parsed[1]) {
                  const info = parsed[1];
                  // ONLY register if a valid room exists on this host
                  if (info.roomCode && info.status !== 'open') {
                    this.registerDiscoveredGame({
                      id: cleanAddr,
                      ip: cleanAddr.split(':')[0],
                      port: cleanAddr.split(':')[1] || '3001',
                      hostName: info.hostName || 'Nearby Host',
                      roomCode: info.roomCode,
                      players: info.players || 1,
                      maxPlayers: info.maxPlayers || 4,
                      latency: latency,
                      targetUrl: `http://${cleanAddr}`,
                      networkType: cleanAddr.includes('192.168.43.1') ? 'hotspot' : 'wifi',
                    });
                  }
                  clearTimeout(timer);
                  finish();
                  return;
                }
              } catch {}
            }
          }
        };

        socket.onerror = finish;
        socket.onclose = finish;
      } catch (err) {
        clearTimeout(timer);
        finish();
      }
    });
  }

  /**
   * Register or update a discovered game
   */
  registerDiscoveredGame(game) {
    if (!game || !game.id || !game.roomCode) return;

    this.discoveredGames.set(game.id, {
      ...game,
      lastSeen: Date.now(),
    });

    if (this.onGameFoundCallback) {
      const allGames = Array.from(this.discoveredGames.values());
      this.onGameFoundCallback(allGames);
    }
  }

  /**
   * Get list of currently discovered games
   */
  getDiscoveredGames() {
    return Array.from(this.discoveredGames.values());
  }
}

export const lanDiscovery = new LanDiscoveryService();
export default lanDiscovery;
