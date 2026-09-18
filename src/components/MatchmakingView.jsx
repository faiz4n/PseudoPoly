import React, { useState, useRef, useEffect } from 'react';
import lanDiscovery from '../services/lanDiscovery';

// --- CLEAN GAME SVG ICONS ---
function UsersIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function WifiIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
    </svg>
  );
}

function GlobeIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function CrownIcon({ size = 16, color = "#FFD700" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="#B26A00" strokeWidth="1">
      <path d="M2 4l3 12h14l3-12-6 7-4-8-4 8-6-7z" />
    </svg>
  );
}

function SettingsIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function HelpIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
    </svg>
  );
}

function DiceIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function RadarIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="12" x2="19" y2="5" />
    </svg>
  );
}

export default function MatchmakingView({
  gameStage,
  setGameStage,
  setNetworkMode,
  myIdentity,
  setMyIdentity,
  players = [],
  AVATAR_COLORS = {},
  initializeHost,
  joinRoom,
  joinCode,
  setJoinCode,
  roomCode,
  connectedPlayers = [],
  myPlayerIndex,
  startGame,
  onLeaveRoom,
  showToast,
  startupBg,
  devMode,
  onToggleDevMode,
  onOpenSettings,
  serverUrl,
  updateServerUrl,
  socketConnected,
  onToggleReady,
}) {
  const [activeScreen, setActiveScreen] = useState('home');
  const [discoveredGames, setDiscoveredGames] = useState([]);
  const [scanStatus, setScanStatus] = useState('Searching for nearby games...');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const pinInputRef = useRef(null);

  // Sync with App's gameStage (e.g. when room is joined, gameStage becomes 'lobby')
  useEffect(() => {
    if (gameStage === 'lobby') {
      setActiveScreen('lobby');
    } else if (gameStage === 'menu') {
      setActiveScreen('home');
    } else if (gameStage === 'mode_select') {
      setActiveScreen('mode_select');
    } else if (gameStage === 'online_menu') {
      setActiveScreen('online_menu');
    }
  }, [gameStage]);

  // Handle LAN Discovery scanning when in 'hotspot_scan'
  useEffect(() => {
    if (activeScreen === 'hotspot_scan') {
      setDiscoveredGames([]);
      lanDiscovery.startScan(
        (games) => {
          setDiscoveredGames(games);
          if (games.length > 0) {
            setScanStatus(`Found ${games.length} game${games.length > 1 ? 's' : ''}!`);
          }
        },
        (status) => setScanStatus(status)
      );

      return () => {
        lanDiscovery.stopScan();
      };
    }
  }, [activeScreen]);

  // Handle Hosting a Hotspot Game (Mini Militia Style)
  const handleStartHosting = () => {
    showToast('Starting local game room on this device...');
    setNetworkMode('online');
    initializeHost();
  };

  // Handle Joining a Discovered Host (Zero code, 1-tap join)
  const handleJoinGame = (game) => {
    if (!game) return;
    showToast(`Connecting to ${game.hostName}...`);
    if (game.targetUrl) {
      updateServerUrl(game.targetUrl);
    }
    setJoinCode(game.roomCode || '');
    joinRoom();
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(String(roomCode));
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = String(roomCode);
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      showToast(`Copied Room Code: ${roomCode}`);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      showToast(`Room Code: ${roomCode}`);
    }
  };

  const handlePasteCode = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        const digits = text.replace(/\D/g, '').slice(0, 4);
        if (digits.length > 0) {
          setJoinCode(digits);
          showToast(`Pasted code: ${digits}`);
        }
      }
    } catch {}
  };

  // Check player ready state
  const isHost = myPlayerIndex === 0;
  const myPlayer = connectedPlayers[myPlayerIndex] || null;
  const isMeReady = isHost || (myPlayer && myPlayer.isReady === true);
  
  // All non-host players must be ready and at least 2 players in lobby to start
  const canStartGame = connectedPlayers.length >= 2 && connectedPlayers.every(p => p.isHost || p.isReady === true);

  const activeColor = AVATAR_COLORS[myIdentity.avatar] || '#ffd700';
  const TOTAL_SLOTS = 4;

  return (
    <div className="mm-overlay">
      <div 
        className="mm-backdrop" 
        style={{ backgroundImage: startupBg ? `url(${startupBg})` : 'none' }} 
      />

      <div className="mm-container">
        {/* =================================================================
            SCREEN 1: HOMEPAGE (LANDSCAPE SPLIT VIEW)
            ================================================================= */}
        {activeScreen === 'home' && (
          <div className="mm-home-grid">
            {/* Left Brand Area */}
            <div className="mm-home-brand">
              <span className="mm-brand-badge">MULTIPLAYER BOARD GAME</span>
              <h1 className="mm-brand-title">PSEUDO POLY</h1>
              <p className="mm-brand-desc">
                Fast-paced, high-stakes real estate trading. Buy properties, collect rent, and bankrupt your rivals!
              </p>

              <button 
                className="mm-play-btn pulse"
                onClick={() => setActiveScreen('mode_select')}
              >
                <span>PLAY NOW</span>
                <span style={{ fontSize: '15px' }}>▶</span>
              </button>
            </div>

            {/* Right Player Identity & Quick Tools */}
            <div className="mm-home-profile">
              <div className="mm-profile-top">
                <div 
                  className="mm-profile-avatar-frame"
                  style={{ border: `2.5px solid ${activeColor}`, boxShadow: `0 0 14px ${activeColor}88` }}
                >
                  <img 
                    src={myIdentity.avatar} 
                    alt="Player Avatar" 
                    className="mm-profile-avatar-img" 
                  />
                </div>
                <div className="mm-profile-info">
                  <span className="mm-field-label">YOUR NICKNAME</span>
                  <input 
                    type="text" 
                    className="mm-nickname-input"
                    maxLength={14}
                    value={myIdentity.name}
                    onChange={(e) => setMyIdentity(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter Name"
                  />
                </div>
              </div>

              {/* Avatar Selector Strip */}
              <div>
                <span className="mm-field-label" style={{ marginBottom: '6px', display: 'block' }}>CHOOSE AVATAR</span>
                <div className="mm-avatar-picker">
                  {(players || []).map((p, idx) => {
                    const isSelected = myIdentity.avatar === p.avatar;
                    const pColor = AVATAR_COLORS[p.avatar] || '#ffd700';
                    return (
                      <div 
                        key={idx}
                        className={`mm-avatar-thumb ${isSelected ? 'active' : ''}`}
                        style={{ borderColor: isSelected ? pColor : 'transparent' }}
                        onClick={() => setMyIdentity(prev => ({ ...prev, avatar: p.avatar }))}
                      >
                        <img src={p.avatar} alt={`Avatar ${idx + 1}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Actions Bar */}
              <div className="mm-home-actions-bar">
                <button 
                  className="mm-tool-btn"
                  onClick={onOpenSettings}
                >
                  <SettingsIcon size={16} />
                  <span>Settings</span>
                </button>
                <button 
                  className="mm-tool-btn"
                  onClick={() => setShowRulesModal(true)}
                >
                  <HelpIcon size={16} />
                  <span>How to Play</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            SCREEN 2: GAME MODE SELECT (3 HORIZONTAL CARDS)
            ================================================================= */}
        {activeScreen === 'mode_select' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="mm-header">
              <button 
                className="mm-back-btn" 
                onClick={() => setActiveScreen('home')}
                title="Back to title"
              >
                ←
              </button>
              <h2 className="mm-header-title">SELECT GAME MODE</h2>
              <div className="mm-header-spacer" />
            </div>

            <div className="mm-modes-grid">
              {/* Mode 1: Pass & Play */}
              <div 
                className="mm-mode-box offline"
                onClick={() => {
                  setNetworkMode('offline');
                  setGameStage('playing');
                }}
              >
                <div className="mm-mode-top">
                  <div className="mm-mode-icon-circle">
                    <UsersIcon size={24} />
                  </div>
                  <span className="mm-mode-tag">OFFLINE</span>
                </div>
                <div>
                  <div className="mm-mode-title">Pass & Play</div>
                  <p className="mm-mode-desc">
                    Play together on this device. Take turns rolling the dice and building monopolies!
                  </p>
                </div>
                <div className="mm-mode-cta">
                  <span>PLAY NOW</span>
                  <span>→</span>
                </div>
              </div>

              {/* Mode 2: Hotspot Multiplayer (Mini Militia Style) */}
              <div 
                className="mm-mode-box hotspot"
                onClick={() => setActiveScreen('hotspot_choice')}
              >
                <div className="mm-mode-top">
                  <div className="mm-mode-icon-circle">
                    <WifiIcon size={24} />
                  </div>
                  <span className="mm-mode-tag">LOCAL LAN</span>
                </div>
                <div>
                  <div className="mm-mode-title">Hotspot Multiplayer</div>
                  <p className="mm-mode-desc">
                    Mini Militia style LAN: Host on phone hotspot or Wi-Fi. Auto-discovery, zero internet required!
                  </p>
                </div>
                <div className="mm-mode-cta">
                  <span>OPEN LOBBY</span>
                  <span>→</span>
                </div>
              </div>

              {/* Mode 3: Online Play */}
              <div 
                className="mm-mode-box online"
                onClick={() => setActiveScreen('online_menu')}
              >
                <div className="mm-mode-top">
                  <div className="mm-mode-icon-circle">
                    <GlobeIcon size={24} />
                  </div>
                  <span className="mm-mode-tag">ONLINE ROOMS</span>
                </div>
                <div>
                  <div className="mm-mode-title">Online Play</div>
                  <p className="mm-mode-desc">
                    Play with friends over the internet. Create or join custom private rooms.
                  </p>
                </div>
                <div className="mm-mode-cta">
                  <span>BROWSE ROOMS</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            SCREEN 3: HOTSPOT CHOICE (HOST vs JOIN)
            ================================================================= */}
        {activeScreen === 'hotspot_choice' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="mm-header">
              <button 
                className="mm-back-btn" 
                onClick={() => setActiveScreen('mode_select')}
                title="Back to mode select"
              >
                ←
              </button>
              <h2 className="mm-header-title">HOTSPOT MULTIPLAYER</h2>
              <div className="mm-header-spacer" />
            </div>

            <div className="mm-hotspot-choice-grid">
              {/* Host Card */}
              <div 
                className="mm-choice-card host-choice"
                onClick={handleStartHosting}
              >
                <div>
                  <div className="mm-choice-header">
                    <div className="mm-choice-icon">
                      <WifiIcon size={28} />
                    </div>
                    <div>
                      <h3 className="mm-choice-title">HOST GAME</h3>
                      <p className="mm-choice-sub">Create a local room on this phone</p>
                    </div>
                  </div>
                  <div className="mm-choice-perks">
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>Runs server directly on this device</span>
                    </div>
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>Nearby players discover your game automatically</span>
                    </div>
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>Works 100% offline (Airplane mode / Hotspot)</span>
                    </div>
                  </div>
                </div>

                <button className="mm-choice-btn" onClick={handleStartHosting}>
                  <span>START HOSTING</span>
                  <span>✨</span>
                </button>
              </div>

              {/* Join Card */}
              <div 
                className="mm-choice-card join-choice"
                onClick={() => setActiveScreen('hotspot_scan')}
              >
                <div>
                  <div className="mm-choice-header">
                    <div className="mm-choice-icon">
                      <RadarIcon size={28} />
                    </div>
                    <div>
                      <h3 className="mm-choice-title">JOIN GAME</h3>
                      <p className="mm-choice-sub">Search for games on this Wi-Fi / Hotspot</p>
                    </div>
                  </div>
                  <div className="mm-choice-perks">
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>Automatic LAN & Hotspot game discovery</span>
                    </div>
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>1-tap join without typing IP addresses</span>
                    </div>
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>Instant sync into host's lobby</span>
                    </div>
                  </div>
                </div>

                <button className="mm-choice-btn" onClick={() => setActiveScreen('hotspot_scan')}>
                  <span>SCAN FOR GAMES</span>
                  <span>🔍</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            SCREEN 4: HOTSPOT SCANNING & DISCOVERED GAMES (RADAR)
            ================================================================= */}
        {activeScreen === 'hotspot_scan' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="mm-header">
              <button 
                className="mm-back-btn" 
                onClick={() => setActiveScreen('hotspot_choice')}
                title="Back"
              >
                ←
              </button>
              <h2 className="mm-header-title">NEARBY GAMES</h2>
              <div className="mm-header-spacer" />
            </div>

            <div className="mm-scan-grid">
              {/* Left: Radar Visual */}
              <div className="mm-radar-pane">
                <div className="mm-radar-circle-wrap">
                  <div className="mm-radar-wave" />
                  <div className="mm-radar-wave" />
                  <div className="mm-radar-wave" />
                  <div className="mm-radar-center">
                    <RadarIcon size={24} />
                  </div>
                </div>
                <h4 className="mm-radar-status">{scanStatus}</h4>
                <p className="mm-radar-hint">
                  Make sure your phone is connected to the host's portable Wi-Fi hotspot.
                </p>
              </div>

              {/* Right: Discovered Games List */}
              <div className="mm-games-pane">
                <div className="mm-field-label" style={{ marginBottom: '8px' }}>
                  AVAILABLE LOCAL ROOMS ({discoveredGames.length})
                </div>

                <div className="mm-games-list">
                  {discoveredGames.length > 0 ? (
                    discoveredGames.map((game, index) => (
                      <div key={index} className="mm-game-item">
                        <div className="mm-game-item-info">
                          <div className="mm-game-item-host">
                            {game.hostName ? `${game.hostName}'s Room` : 'Pseudo Poly Room'}
                          </div>
                          <div className="mm-game-item-sub">
                            <span className="dot" />
                            <span>{game.players || 1} / {game.maxPlayers || 4} Players</span>
                            <span>•</span>
                            <span>{game.networkType === 'hotspot' ? '📱 Hotspot' : 'Wi-Fi'}</span>
                            {game.latency !== undefined && (
                              <span>• {game.latency}ms</span>
                            )}
                          </div>
                        </div>

                        <button 
                          className="mm-join-item-btn"
                          onClick={() => handleJoinGame(game)}
                        >
                          JOIN
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="mm-no-games">
                      <p className="mm-no-games-text">No games found on this network yet.</p>
                      <button 
                        className="mm-scan-again-btn"
                        onClick={() => lanDiscovery.runScanCycle()}
                      >
                        SCAN AGAIN 🔄
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    className="mm-tool-btn"
                    onClick={() => setActiveScreen('online_menu')}
                  >
                    <span>Manual Code Join</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            SCREEN 5: ONLINE ROOMS MENU (SYMMETRICAL LANDSCAPE GRID)
            ================================================================= */}
        {activeScreen === 'online_menu' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="mm-header">
              <button 
                className="mm-back-btn" 
                onClick={() => setActiveScreen('mode_select')}
                title="Back to mode select"
              >
                ←
              </button>
              <h2 className="mm-header-title">ONLINE ROOMS</h2>
              <div className="mm-header-spacer" />
            </div>

            <div className="mm-online-grid">
              {/* Host Card */}
              <div className="mm-choice-card host-choice">
                <div>
                  <div className="mm-choice-header">
                    <div className="mm-choice-icon">
                      <GlobeIcon size={26} />
                    </div>
                    <div>
                      <h3 className="mm-choice-title">CREATE ROOM</h3>
                      <p className="mm-choice-sub">Generate private code for friends</p>
                    </div>
                  </div>
                  <div className="mm-choice-perks">
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>4-digit private room code</span>
                    </div>
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>Supports 2 to 4 players</span>
                    </div>
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>Full host match controls</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="mm-choice-btn"
                  onClick={() => {
                    setNetworkMode('online');
                    initializeHost();
                  }}
                >
                  <span>CREATE ROOM</span>
                  <span>✨</span>
                </button>
              </div>

              {/* Join with PIN Boxes Card */}
              <div className="mm-choice-card join-choice">
                <div>
                  <div className="mm-choice-header">
                    <div className="mm-choice-icon">
                      <DiceIcon size={26} />
                    </div>
                    <div>
                      <h3 className="mm-choice-title">JOIN WITH CODE</h3>
                      <p className="mm-choice-sub">Enter friend's 4-digit code</p>
                    </div>
                  </div>

                  {/* 4 PIN Digit Boxes */}
                  <div 
                    className="mm-pin-container"
                    onClick={() => pinInputRef.current?.focus()}
                  >
                    <input 
                      ref={pinInputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      className="mm-pin-hidden-input"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                    />
                    {[0, 1, 2, 3].map((i) => {
                      const char = joinCode[i] || '';
                      const isCurrent = joinCode.length === i;
                      return (
                        <div 
                          key={i} 
                          className={`mm-pin-box ${isCurrent ? 'active' : ''} ${char ? 'filled' : ''}`}
                        >
                          {char || (isCurrent ? '·' : '')}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mm-pin-actions-row">
                  <button 
                    type="button" 
                    className="mm-paste-btn"
                    onClick={handlePasteCode}
                  >
                    Paste
                  </button>
                  <button 
                    className="mm-choice-btn"
                    style={{ flex: 1, marginTop: 0 }}
                    disabled={joinCode.length !== 4}
                    onClick={() => {
                      if (joinCode.length === 4) {
                        setNetworkMode('online');
                        joinRoom();
                      } else {
                        showToast('Please enter a 4-digit code');
                      }
                    }}
                  >
                    <span>JOIN ROOM</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            SCREEN 6: MULTIPLAYER LOBBY (LANDSCAPE 4-SLOT ROW)
            ================================================================= */}
        {activeScreen === 'lobby' && (
          <div className="mm-lobby-container">
            {/* Lobby Top Bar */}
            <div className="mm-lobby-top-bar">
              <button 
                className="mm-lobby-leave-btn"
                onClick={onLeaveRoom}
              >
                ← LEAVE LOBBY
              </button>

              <div className="mm-lobby-badge-group">
                <span className="mm-lobby-badge">🟢 LOCAL LAN</span>
                {roomCode && (
                  <button 
                    className={`mm-lobby-code-chip ${isCopied ? 'copied' : ''}`}
                    onClick={handleCopyCode}
                    title="Click to copy code"
                  >
                    <span>CODE: {roomCode}</span>
                    <span>{isCopied ? '✓' : '📋'}</span>
                  </button>
                )}
                <span className="mm-lobby-count">
                  {connectedPlayers.length} / {TOTAL_SLOTS} PLAYERS
                </span>
              </div>
            </div>

            {/* 4 Horizontal Player Slots */}
            <div className="mm-lobby-slots-row">
              {Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
                const player = connectedPlayers[index] || null;
                const isSlotHost = index === 0;
                const isMe = index === myPlayerIndex;

                if (player) {
                  const pColor = AVATAR_COLORS[player.avatar] || '#ffd700';
                  const isPlayerReady = isSlotHost || player.isReady === true;

                  return (
                    <div 
                      key={index}
                      className={`mm-slot-card occupied ${isMe ? 'is-me' : ''}`}
                      style={{ borderTop: `3px solid ${pColor}` }}
                    >
                      <div 
                        className="mm-slot-avatar-wrap"
                        style={{ border: `2px solid ${pColor}`, boxShadow: `0 0 10px ${pColor}66` }}
                      >
                        <img src={player.avatar} alt={player.name} />
                        {isSlotHost && (
                          <div className="mm-slot-crown-badge">
                            <CrownIcon size={12} />
                          </div>
                        )}
                      </div>

                      <div className="mm-slot-name" title={player.name}>
                        {player.name} {isMe && '(You)'}
                      </div>

                      <span className={`mm-slot-status-pill ${isSlotHost ? 'host' : (isPlayerReady ? 'ready' : 'not-ready')}`}>
                        {isSlotHost ? 'HOST' : (isPlayerReady ? 'READY' : 'NOT READY')}
                      </span>
                    </div>
                  );
                }

                // Empty Slot Waiting
                return (
                  <div key={index} className="mm-slot-card empty">
                    <div className="mm-empty-radar-icon">
                      <RadarIcon size={24} />
                    </div>
                    <div className="mm-empty-slot-text">Slot {index + 1} Open</div>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>Waiting...</span>
                  </div>
                );
              })}
            </div>

            {/* Lobby Action Footer */}
            <div className="mm-lobby-footer">
              <div className="mm-lobby-msg">
                {!canStartGame ? (
                  <span>⚠️ Need at least 2 players and everyone ready to start.</span>
                ) : (
                  <span style={{ color: '#34d399' }}>✓ All players ready! Ready to roll!</span>
                )}
              </div>

              {/* Host Action or Joiner Action */}
              <div>
                {isHost ? (
                  <button 
                    className={`mm-start-game-btn ${canStartGame ? 'pulse' : 'disabled'}`}
                    disabled={!canStartGame}
                    onClick={() => {
                      if (canStartGame) {
                        startGame();
                      } else {
                        showToast('Waiting for all players to be ready!');
                      }
                    }}
                  >
                    <span>START GAME</span>
                    <DiceIcon size={18} />
                  </button>
                ) : (
                  <button 
                    className={`mm-ready-toggle-btn ${isMeReady ? 'is-ready' : 'not-ready'}`}
                    onClick={() => {
                      if (onToggleReady) {
                        onToggleReady();
                      } else {
                        showToast('Ready state updated');
                      }
                    }}
                  >
                    <span>{isMeReady ? 'I\'M READY ✓' : 'TAP TO READY ✕'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            MODAL: HOW TO PLAY RULES
            ================================================================= */}
        {showRulesModal && (
          <div className="mm-modal-overlay" onClick={() => setShowRulesModal(false)}>
            <div className="mm-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="mm-modal-header">
                <h3 className="mm-modal-title">HOW TO PLAY PSEUDO POLY</h3>
                <button className="mm-modal-close" onClick={() => setShowRulesModal(false)}>✕</button>
              </div>

              <div className="mm-rules-text">
                <p><b>1. Roll & Move:</b> Take turns rolling dice to move around the board.</p>
                <p><b>2. Properties:</b> Land on unowned properties to buy them. When opponents land on your tiles, they pay you rent!</p>
                <p><b>3. Monopolies:</b> Own all properties of a color group to collect double rent and build upgrades.</p>
                <p><b>4. Special Tiles:</b> Rob the Bank for instant cash, avoid The Audit tax inspection, and ride trains across town!</p>
                <p><b>5. Victory:</b> Drive all opponents to bankruptcy to win the game!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
