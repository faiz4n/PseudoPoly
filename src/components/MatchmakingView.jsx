import React, { useState, useRef, useEffect } from "react";
import lanDiscovery from "../services/lanDiscovery";
import {
  CHOOSABLE_AVATARS,
  getAvatarColor,
  resolveAvatar,
} from "../data/boardData";
import titleLogo from "../assets/title_logo.png";
import homeBg from "../assets/home_bg.jpg";

// --- CLEAN GAME SVG ICONS ---
function UsersIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function WifiIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
    </svg>
  );
}

function GlobeIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function CrownIcon({ size = 16, color = "#FFD700" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke="#B26A00"
      strokeWidth="1"
    >
      <path d="M2 4l3 12h14l3-12-6 7-4-8-4 8-6-7z" />
    </svg>
  );
}

function SettingsIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function HelpIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
    </svg>
  );
}

function DiceIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="12" x2="19" y2="5" />
    </svg>
  );
}

function UserIcon({ size = 12, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BotIcon({ size = 12, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2" />
      <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2" />
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
  avatarOptions = [],
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
  matchmakingPending,
  onRegisterBackHandler,
  onStartPassAndPlay,
}) {
  const [activeScreen, setActiveScreen] = useState("home");
  const [discoveredGames, setDiscoveredGames] = useState([]);
  const [scanStatus, setScanStatus] = useState("Searching for nearby games...");
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const pinInputRef = useRef(null);

  // Pass & Play Custom Slots Setup (2 to 6 Players & Bots)
  const BOT_DEFAULT_NAMES = [
    "Bot Alpha",
    "Bot Bravo",
    "Bot Charlie",
    "Bot Delta",
    "Bot Echo",
    "Bot Foxtrot",
  ];

  const [passPlaySlots, setPassPlaySlots] = useState(() => [
    {
      id: 0,
      name: myIdentity?.name || "Player 1",
      avatar: myIdentity?.avatar || avatarOptions[0]?.avatar,
      isBot: false,
      color: avatarOptions[0]?.color || "#E64A19",
    },
    {
      id: 1,
      name: "Bot Alpha",
      avatar: avatarOptions[1]?.avatar || avatarOptions[0]?.avatar,
      isBot: true,
      color: avatarOptions[1]?.color || "#2196F3",
    },
  ]);

  const handleAddPassPlaySlot = () => {
    if (passPlaySlots.length >= 6) return;
    const nextIdx = passPlaySlots.length;
    const usedAvatars = passPlaySlots.map((s) => s.avatar);
    const available =
      avatarOptions.find((a) => !usedAvatars.includes(a.avatar)) ||
      avatarOptions[nextIdx % avatarOptions.length];

    setPassPlaySlots((prev) => [
      ...prev,
      {
        id: nextIdx,
        name: BOT_DEFAULT_NAMES[nextIdx] || `Bot ${nextIdx + 1}`,
        avatar: available.avatar,
        isBot: true,
        color: available.color || "#43A047",
      },
    ]);
  };

  const handleRemovePassPlaySlot = (index) => {
    if (passPlaySlots.length <= 2) return;
    setPassPlaySlots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleTogglePassPlayBot = (index) => {
    setPassPlaySlots((prev) =>
      prev.map((slot, idx) => {
        if (idx !== index) return slot;
        const newIsBot = !slot.isBot;
        let newName = slot.name;
        if (newIsBot && (slot.name === `Player ${idx + 1}` || slot.name === "")) {
          newName = BOT_DEFAULT_NAMES[idx] || `Bot ${idx + 1}`;
        } else if (!newIsBot && slot.name.startsWith("Bot")) {
          newName =
            idx === 0 && myIdentity?.name
              ? myIdentity.name
              : `Player ${idx + 1}`;
        }
        return {
          ...slot,
          isBot: newIsBot,
          name: newName,
        };
      })
    );
  };

  const handleCyclePassPlayAvatar = (index) => {
    setPassPlaySlots((prev) =>
      prev.map((slot, idx) => {
        if (idx !== index) return slot;
        const currentAvatarIdx = avatarOptions.findIndex(
          (a) => a.avatar === slot.avatar
        );
        const nextAvatar =
          avatarOptions[(currentAvatarIdx + 1) % avatarOptions.length];
        return {
          ...slot,
          avatar: nextAvatar.avatar,
          color: nextAvatar.color,
        };
      })
    );
  };

  const handleUpdatePassPlayName = (index, newName) => {
    setPassPlaySlots((prev) =>
      prev.map((slot, idx) =>
        idx === index ? { ...slot, name: newName } : slot
      )
    );
  };

  // Register back gesture handler for Matchmaking screens and sub-modals
  useEffect(() => {
    if (typeof onRegisterBackHandler === "function") {
      onRegisterBackHandler(() => {
        if (showRulesModal) {
          setShowRulesModal(false);
          return true;
        }
        if (showProfileDrawer) {
          setShowProfileDrawer(false);
          return true;
        }
        if (activeScreen === "pass_play_setup") {
          setActiveScreen("mode_select");
          return true;
        }
        if (activeScreen === "hotspot_scan") {
          setActiveScreen("hotspot_choice");
          return true;
        }
        if (
          activeScreen === "hotspot_choice" ||
          activeScreen === "online_menu"
        ) {
          setActiveScreen("mode_select");
          return true;
        }
        if (activeScreen === "mode_select") {
          setActiveScreen("home");
          return true;
        }
        return false;
      });
    }
  }, [activeScreen, showRulesModal, showProfileDrawer, onRegisterBackHandler]);

  // Sync with App's gameStage (e.g. when room is joined, gameStage becomes 'lobby')
  useEffect(() => {
    if (gameStage === "lobby") {
      setActiveScreen("lobby");
    } else if (gameStage === "menu") {
      setActiveScreen("home");
    } else if (gameStage === "mode_select") {
      setActiveScreen("mode_select");
    } else if (gameStage === "online_menu") {
      setActiveScreen("online_menu");
    }
  }, [gameStage]);

  // Handle LAN Discovery scanning when in 'hotspot_scan'
  useEffect(() => {
    if (activeScreen === "hotspot_scan") {
      setDiscoveredGames([]);
      lanDiscovery.startScan(
        (games) => {
          setDiscoveredGames(games);
          if (games.length > 0) {
            setScanStatus(
              `Found ${games.length} game${games.length > 1 ? "s" : ""}!`,
            );
          }
        },
        (status) => setScanStatus(status),
      );

      return () => {
        lanDiscovery.stopScan();
      };
    }
  }, [activeScreen]);

  // Handle Hosting a Hotspot Game (Mini Militia Style)
  const handleStartHosting = () => {
    if (matchmakingPending) return;
    showToast("Starting local game room on this device...");
    setNetworkMode("online");
    initializeHost("hotspot");
  };

  // Handle Joining a Discovered Host (Zero code, 1-tap join)
  const handleJoinGame = (game) => {
    if (!game || matchmakingPending) return;
    showToast(`Connecting to ${game.hostName}...`);
    if (game.targetUrl) {
      updateServerUrl(game.targetUrl);
    }
    setJoinCode(game.roomCode || "");
    joinRoom(game.roomCode || "", game.targetUrl, "hotspot");
  };

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(String(roomCode));
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = String(roomCode);
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
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
        const digits = text.replace(/\D/g, "").slice(0, 4);
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
  const canStartGame =
    connectedPlayers.length >= 2 &&
    connectedPlayers.every((p) => p.isHost || p.isReady === true);

  const activeColor =
    AVATAR_COLORS[myIdentity.avatar] ||
    getAvatarColor(myIdentity.avatar) ||
    "#ffd700";
  const TOTAL_SLOTS = 6;

  return (
    <div className="mm-overlay">
      <div
        className={`mm-backdrop ${activeScreen === "home" ? "unblurred" : "blurred"}`}
        style={{
          backgroundImage: `url(${homeBg})`,
        }}
      />
      <div
        className={`mm-dark-filter ${activeScreen === "home" ? "home-filter" : "page-filter"}`}
      />

      <div className={`mm-container ${activeScreen === "home" ? "mm-container--home" : ""}`}>

        {/* =================================================================
            PROFILE DRAWER OVERLAY
            ================================================================= */}
        {showProfileDrawer && (
          <div
            className="mm-profile-drawer-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowProfileDrawer(false);
            }}
          >
            <div className={`mm-profile-drawer ${showProfileDrawer ? "open" : ""}`}>
              <button
                className="mm-profile-close-btn"
                onClick={() => setShowProfileDrawer(false)}
              >
                ✕
              </button>

              <div
                className="mm-profile-avatar-frame"
                style={{
                  border: `3px solid ${activeColor}`,
                  boxShadow: `0 0 18px ${activeColor}88`,
                }}
              >
                <img
                  src={resolveAvatar(myIdentity.avatar)}
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
                  onChange={(e) =>
                    setMyIdentity((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter Name"
                />
              </div>

              {/* Avatar Selector Strip */}
              <div>
                <span
                  className="mm-field-label"
                  style={{ marginBottom: "8px", display: "block" }}
                >
                  CHOOSE AVATAR
                </span>
                <div className="mm-avatar-picker">
                  {(avatarOptions && avatarOptions.length > 0
                    ? avatarOptions
                    : CHOOSABLE_AVATARS
                  ).map((p, idx) => {
                    const isSelected =
                      myIdentity.avatar === p.avatar ||
                      resolveAvatar(myIdentity.avatar) === resolveAvatar(p.avatar) ||
                      (typeof myIdentity.avatar === "string" &&
                        typeof p.avatar === "string" &&
                        (myIdentity.avatar.includes(p.id || "") ||
                          (myIdentity.avatar.includes("red") && p.id === "red") ||
                          (myIdentity.avatar.includes("green") && p.id === "green") ||
                          (myIdentity.avatar.includes("orange") && p.id === "orange") ||
                          (myIdentity.avatar.includes("blue") && p.id === "blue") ||
                          (myIdentity.avatar.includes("white") && p.id === "white") ||
                          (myIdentity.avatar.includes("black") && p.id === "black")));
                    const pColor =
                      AVATAR_COLORS[p.avatar] || p.color || getAvatarColor(p.avatar);
                    return (
                      <div
                        key={p.id || idx}
                        className={`mm-avatar-thumb ${isSelected ? "active" : ""}`}
                        style={{
                          borderColor: isSelected ? pColor : "transparent",
                          boxShadow: isSelected
                            ? `0 0 10px ${pColor}99`
                            : "none",
                        }}
                        onClick={() =>
                          setMyIdentity((prev) => ({
                            ...prev,
                            avatar: p.avatar,
                          }))
                        }
                      >
                        <img src={resolveAvatar(p.avatar)} alt={p.name || `Avatar ${idx + 1}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            SCREEN 1: HOMEPAGE — HERO LAYOUT
            ================================================================= */}
        {activeScreen === "home" && (
          <div className="mm-home-hero">
            {/* Top bar: Avatar left, Settings right */}
            <div className="mm-home-topbar">
              <button
                className="mm-home-avatar-btn"
                onClick={() => setShowProfileDrawer(true)}
                style={{
                  border: `2px solid ${activeColor}`,
                  boxShadow: `0 0 10px ${activeColor}66`,
                }}
              >
                <img src={resolveAvatar(myIdentity.avatar)} alt="Profile" />
              </button>

              <button
                className="mm-home-settings-btn"
                onClick={onOpenSettings}
              >
                <SettingsIcon size={20} color="#ffffff" />
              </button>
            </div>

            {/* Center: Logo + Actions */}
            <div className="mm-home-logo">
              <img src={titleLogo} alt="PseudoPoly" />
            </div>

            <div className="mm-home-actions">
              <button
                className="mm-play-btn pulse"
                onClick={() => setActiveScreen("mode_select")}
              >
                <span style={{ fontSize: "18px" }}>▶</span>
                <span>PLAY</span>
              </button>

              <button
                className="mm-howto-btn"
                onClick={() => setShowRulesModal(true)}
              >
                <DiceIcon size={18} color="#ffffff" />
                <span>HOW TO PLAY</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            SCREEN 2: GAME MODE SELECT — 3 COLORED CARDS
            ================================================================= */}
        {activeScreen === "mode_select" && (
          <div
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <div className="mm-header">
              <button
                className="mm-back-btn"
                onClick={() => setActiveScreen("home")}
                title="Back to title"
              >
                ‹
              </button>
              <div style={{ flex: 1, textAlign: "center" }}>
                <h2 className="mm-header-title">CHOOSE A MODE</h2>
                <p className="mm-header-subtitle">How do you want to play?</p>
              </div>
              <div className="mm-header-spacer" />
            </div>

            <div className="mm-modes-grid">
              {/* Mode 1: Pass & Play */}
              <div
                className="mm-mode-card pass-play"
                onClick={() => setActiveScreen("pass_play_setup")}
              >
                <div className="mm-mode-icon-wrap">
                  <UsersIcon size={24} color="#27ae60" />
                </div>
                <div className="mm-mode-title">Pass and Play</div>
                <p className="mm-mode-desc">
                  Play on the same device with friends
                </p>
                <button className="mm-mode-play-btn">Play</button>
              </div>

              {/* Mode 2: Hotspot Multiplayer */}
              <div
                className="mm-mode-card hotspot"
                onClick={() => setActiveScreen("hotspot_choice")}
              >
                <div className="mm-mode-icon-wrap">
                  <WifiIcon size={24} color="#1e88e5" />
                </div>
                <div className="mm-mode-title">Hotspot Multiplayer</div>
                <p className="mm-mode-desc">
                  Play with friends nearby using hotspot
                </p>
                <button className="mm-mode-play-btn">Play</button>
              </div>

              {/* Mode 3: Online Play */}
              <div
                className="mm-mode-card online"
                onClick={() => setActiveScreen("online_menu")}
              >
                <div className="mm-mode-icon-wrap">
                  <GlobeIcon size={24} color="#7b1fa2" />
                </div>
                <div className="mm-mode-title">Online Rooms</div>
                <p className="mm-mode-desc">
                  Create or join a room and play online
                </p>
                <button className="mm-mode-play-btn">Play</button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            SCREEN 2.5: PASS & PLAY SETUP (2 to 6 Players & Bots)
            ================================================================= */}
        {activeScreen === "pass_play_setup" && (
          <div
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <div className="mm-header">
              <button
                className="mm-back-btn"
                onClick={() => setActiveScreen("mode_select")}
                title="Back to mode select"
              >
                ‹
              </button>
              <div style={{ flex: 1, textAlign: "center" }}>
                <h2 className="mm-header-title">PASS & PLAY SETUP</h2>
                <p className="mm-header-subtitle">Choose 2 to 6 players and bots</p>
              </div>
              <div className="mm-header-spacer" />
            </div>

            <div className="mm-passplay-container">
              <div className="mm-passplay-slots-row">
                {passPlaySlots.map((slot, index) => {
                  const slotColor = slot.color || "#ffd54f";
                  return (
                    <div
                      key={slot.id}
                      className={`mm-passplay-card ${slot.isBot ? "is-bot" : ""}`}
                      style={{ borderColor: `${slotColor}88` }}
                    >
                      <div className="mm-passplay-slot-badge">
                        P{index + 1}
                      </div>

                      {passPlaySlots.length > 2 && (
                        <button
                          className="mm-passplay-remove-btn"
                          onClick={() => handleRemovePassPlaySlot(index)}
                          title="Remove Player"
                        >
                          ✕
                        </button>
                      )}

                      <div
                        className="mm-passplay-avatar-wrap"
                        onClick={() => handleCyclePassPlayAvatar(index)}
                        title="Tap to change avatar"
                      >
                        <img
                          src={resolveAvatar(slot.avatar)}
                          alt={slot.name}
                          className="mm-passplay-avatar-img"
                          style={{ borderColor: slotColor }}
                        />
                        <div className="mm-passplay-cycle-hint">↻</div>
                      </div>

                      <input
                        type="text"
                        className="mm-passplay-name-input"
                        value={slot.name}
                        maxLength={12}
                        onChange={(e) =>
                          handleUpdatePassPlayName(index, e.target.value)
                        }
                        placeholder={`Player ${index + 1}`}
                      />

                      <div className="mm-passplay-type-toggle">
                        <button
                          type="button"
                          className={`mm-passplay-type-btn ${!slot.isBot ? "active human" : ""}`}
                          onClick={() => slot.isBot && handleTogglePassPlayBot(index)}
                        >
                          <UserIcon size={11} /> Human
                        </button>
                        <button
                          type="button"
                          className={`mm-passplay-type-btn ${slot.isBot ? "active bot" : ""}`}
                          onClick={() => !slot.isBot && handleTogglePassPlayBot(index)}
                        >
                          <BotIcon size={11} /> Bot
                        </button>
                      </div>
                    </div>
                  );
                })}

                {passPlaySlots.length < 6 && (
                  <div
                    className="mm-passplay-add-card"
                    onClick={handleAddPassPlaySlot}
                  >
                    <div className="mm-passplay-add-icon">+</div>
                    <span>Add Player</span>
                  </div>
                )}
              </div>

              <div className="mm-passplay-footer">
                <div className="mm-passplay-summary">
                  {passPlaySlots.filter((s) => !s.isBot).length} Humans,{" "}
                  {passPlaySlots.filter((s) => s.isBot).length} Bots ({passPlaySlots.length}/6)
                </div>
                <button
                  className="mm-passplay-start-btn"
                  onClick={() => {
                    setNetworkMode("offline");
                    if (typeof onStartPassAndPlay === "function") {
                      onStartPassAndPlay(passPlaySlots);
                    } else {
                      setGameStage("playing");
                    }
                  }}
                >
                  START GAME
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            SCREEN 3: HOTSPOT CHOICE (HOST vs JOIN)
            ================================================================= */}
        {activeScreen === "hotspot_choice" && (
          <div
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <div className="mm-header">
              <button
                className="mm-back-btn"
                onClick={() => setActiveScreen("mode_select")}
                title="Back to mode select"
              >
                ‹
              </button>
              <div style={{ flex: 1, textAlign: "center" }}>
                <h2 className="mm-header-title">Hotspot Multiplayer</h2>
                <p className="mm-header-subtitle">Play with friends nearby using a mobile hotspot</p>
              </div>
              <div className="mm-header-spacer" />
            </div>

            <div className="mm-hotspot-choice-grid">
              {/* Host Card */}
              <div
                className={`mm-choice-card host-choice ${matchmakingPending ? "disabled" : ""}`}
                onClick={matchmakingPending ? undefined : handleStartHosting}
              >
                <div>
                  <div className="mm-choice-header">
                    <div className="mm-choice-icon">
                      <WifiIcon size={28} />
                    </div>
                    <div>
                      <h3 className="mm-choice-title">CREATE GAME</h3>
                      <p className="mm-choice-sub">
                        Start a new game and let your friends join
                      </p>
                    </div>
                  </div>
                  <div className="mm-choice-perks">
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>Runs server directly on this device</span>
                    </div>
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>
                        Nearby players discover your game automatically
                      </span>
                    </div>
                    <div className="mm-choice-perk">
                      <span className="check">✓</span>
                      <span>Works 100% offline (Airplane mode / Hotspot)</span>
                    </div>
                  </div>
                </div>

                <button
                  className="mm-choice-btn"
                  onClick={handleStartHosting}
                  disabled={!!matchmakingPending}
                >
                  {matchmakingPending === "host_hotspot" ? (
                    <>
                      <span className="mm-btn-spinner" />
                      <span>STARTING HOST...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Game</span>
                    </>
                  )}
                </button>
              </div>

              {/* Join Card */}
              <div
                className="mm-choice-card join-choice"
                onClick={() => setActiveScreen("hotspot_scan")}
              >
                <div>
                  <div className="mm-choice-header">
                    <div className="mm-choice-icon">
                      <RadarIcon size={28} />
                    </div>
                    <div>
                      <h3 className="mm-choice-title">JOIN GAME</h3>
                      <p className="mm-choice-sub">
                        Enter the game code from your friend's device
                      </p>
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

                <button
                  className="mm-choice-btn"
                  onClick={() => setActiveScreen("hotspot_scan")}
                >
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
        {activeScreen === "hotspot_scan" && (
          <div
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <div className="mm-header">
              <button
                className="mm-back-btn"
                onClick={() => setActiveScreen("hotspot_choice")}
                title="Back"
              >
                ‹
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
                  Make sure your phone is connected to the host's portable Wi-Fi
                  hotspot.
                </p>
              </div>

              {/* Right: Discovered Games List */}
              <div className="mm-games-pane">
                <div className="mm-field-label" style={{ marginBottom: "8px" }}>
                  AVAILABLE LOCAL ROOMS ({discoveredGames.length})
                </div>

                <div className="mm-games-list">
                  {discoveredGames.length > 0 ? (
                    discoveredGames.map((game, index) => (
                      <div key={index} className="mm-game-item">
                        <div className="mm-game-item-info">
                          <div className="mm-game-item-host">
                            {game.hostName
                              ? `${game.hostName}'s Room`
                              : "Pseudo Poly Room"}
                          </div>
                          <div className="mm-game-item-sub">
                            <span className="dot" />
                            <span>
                              {game.players || 1} / {game.maxPlayers || 4}{" "}
                              Players
                            </span>
                            <span>•</span>
                            <span>
                              {game.networkType === "hotspot"
                                ? "📱 Hotspot"
                                : "Wi-Fi"}
                            </span>
                            {game.latency !== undefined && (
                              <span>• {game.latency}ms</span>
                            )}
                          </div>
                        </div>

                        <button
                          className="mm-join-item-btn"
                          disabled={!!matchmakingPending}
                          onClick={() => handleJoinGame(game)}
                        >
                          {matchmakingPending === "join_game" ? (
                            <>
                              <span className="mm-btn-spinner" />
                              <span>JOINING...</span>
                            </>
                          ) : (
                            "JOIN"
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="mm-no-games">
                      <p className="mm-no-games-text">
                        No games found on this network yet.
                      </p>
                      <button
                        className="mm-scan-again-btn"
                        onClick={() => lanDiscovery.runScanCycle()}
                      >
                        SCAN AGAIN 🔄
                      </button>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "10px",
                  }}
                >
                  <button
                    className="mm-tool-btn"
                    onClick={() => setActiveScreen("online_menu")}
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
            SCREEN 5: ONLINE ROOMS MENU
            ================================================================= */}
        {activeScreen === "online_menu" && (
          <div
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <div className="mm-header">
              <button
                className="mm-back-btn"
                onClick={() => setActiveScreen("mode_select")}
                title="Back to mode select"
              >
                ‹
              </button>
              <div style={{ flex: 1, textAlign: "center" }}>
                <h2 className="mm-header-title">Online Rooms</h2>
                <p className="mm-header-subtitle">Create a room or join an existing one</p>
              </div>
              <div className="mm-header-spacer" />
            </div>

            <div className="mm-online-grid">
              {/* Create Room Card */}
              <div
                className={`mm-choice-card host-choice ${matchmakingPending ? "disabled" : ""}`}
                onClick={
                  matchmakingPending
                    ? undefined
                    : () => {
                        setNetworkMode("online");
                        initializeHost();
                      }
                }
              >
                <div>
                  <div className="mm-choice-header">
                    <div className="mm-choice-icon">
                      <GlobeIcon size={26} />
                    </div>
                    <div>
                      <h3 className="mm-choice-title">CREATE ROOM</h3>
                      <p className="mm-choice-sub">
                        Generate private code for friends
                      </p>
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
                  disabled={!!matchmakingPending}
                  onClick={() => {
                    if (matchmakingPending) return;
                    setNetworkMode("online");
                    initializeHost();
                  }}
                >
                  {matchmakingPending === "create_online" ? (
                    <>
                      <span className="mm-btn-spinner" />
                      <span>CREATING ROOM...</span>
                    </>
                  ) : (
                    <>
                      <span>CREATE ROOM</span>
                      <span>✨</span>
                    </>
                  )}
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
                      <p className="mm-choice-sub">
                        Enter friend's 4-digit code
                      </p>
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
                      onChange={(e) =>
                        setJoinCode(
                          e.target.value.replace(/\D/g, "").slice(0, 4),
                        )
                      }
                      maxLength={4}
                    />
                    {[0, 1, 2, 3].map((i) => {
                      const char = joinCode[i] || "";
                      const isCurrent = joinCode.length === i;
                      return (
                        <div
                          key={i}
                          className={`mm-pin-box ${isCurrent ? "active" : ""} ${char ? "filled" : ""}`}
                        >
                          {char || (isCurrent ? "·" : "")}
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
                    disabled={joinCode.length !== 4 || !!matchmakingPending}
                    onClick={() => {
                      if (matchmakingPending) return;
                      if (joinCode.length === 4) {
                        setNetworkMode("online");
                        joinRoom();
                      } else {
                        showToast("Please enter a 4-digit code");
                      }
                    }}
                  >
                    {matchmakingPending === "join_code" ? (
                      <>
                        <span className="mm-btn-spinner" />
                        <span>JOINING ROOM...</span>
                      </>
                    ) : (
                      <>
                        <span>JOIN ROOM</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================
            SCREEN 6: MULTIPLAYER LOBBY (4 HORIZONTAL PLAYER SLOTS)
            ================================================================= */}
        {activeScreen === "lobby" && (
          <div className="mm-lobby-container">
            {/* Top Bar: Leave, Network Badge, Room Code, Player Count */}
            <div className="mm-lobby-top-bar">
              <button className="mm-lobby-leave-btn" onClick={onLeaveRoom}>
                ← LEAVE
              </button>

              <div className="mm-lobby-badge-group">
                <span className="mm-lobby-badge">🟢 LOCAL LAN</span>

                <button
                  className="mm-lobby-code-chip"
                  onClick={handleCopyCode}
                  title="Click to copy room code"
                >
                  ROOM CODE:{" "}
                  <span className="code-num">{roomCode || "----"}</span>{" "}
                  {isCopied ? "✓" : "📋"}
                </button>

                <span className="mm-lobby-count">
                  {connectedPlayers.length} / {TOTAL_SLOTS} PLAYERS
                </span>
              </div>
            </div>

            {/* 4 Horizontal Player Slots */}
            <div className="mm-lobby-slots-row">
              {Array.from({ length: TOTAL_SLOTS }).map((_, slotIdx) => {
                const player = connectedPlayers[slotIdx];
                const isMe = slotIdx === myPlayerIndex;
                const slotColor = player
                  ? AVATAR_COLORS[player.avatar] ||
                    getAvatarColor(player.avatar) ||
                    "#ffd700"
                  : "#334155";

                if (player) {
                  return (
                    <div
                      key={slotIdx}
                      className={`mm-slot-card occupied ${isMe ? "is-me" : ""}`}
                      style={{ borderColor: slotColor }}
                    >
                      <div className="mm-slot-avatar-wrap">
                        <img
                          src={resolveAvatar(player.avatar)}
                          alt={player.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        {slotIdx === 0 && (
                          <div className="mm-slot-crown-badge">
                            <CrownIcon size={14} />
                          </div>
                        )}
                      </div>

                      <div className="mm-slot-name">
                        {player.name || `Player ${slotIdx + 1}`}
                        {isMe ? " (You)" : ""}
                      </div>

                      <div
                        className="mm-slot-status-pill"
                        style={{
                          background: player.isHost
                            ? "linear-gradient(135deg, #f5a623, #e6930a)"
                            : player.isReady
                              ? "#27ae60"
                              : "#e67e22",
                        }}
                      >
                        {player.isHost
                          ? "HOST"
                          : player.isReady
                            ? "READY"
                            : "NOT READY"}
                      </div>
                    </div>
                  );
                }

                // Empty slot
                return (
                  <div key={slotIdx} className="mm-slot-card empty">
                    <div className="mm-empty-radar-icon">
                      <RadarIcon size={20} color="#475569" />
                    </div>
                    <span className="mm-empty-slot-text">
                      Slot {slotIdx + 1} Open
                    </span>
                    <span
                      className="mm-empty-slot-text"
                      style={{ fontSize: "9px", opacity: 0.5 }}
                    >
                      Waiting...
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer: Status + Action */}
            <div className="mm-lobby-footer">
              <div className="mm-lobby-msg">
                {canStartGame
                  ? "✓ All players ready! Ready to roll!"
                  : "⚠️ Need at least 2 players and everyone ready to start."}
              </div>

              {isHost ? (
                <button
                  className="mm-start-game-btn"
                  disabled={!canStartGame}
                  onClick={startGame}
                >
                  START GAME 🎲
                </button>
              ) : (
                <button
                  className={`mm-ready-toggle-btn ${isMeReady ? "ready" : ""}`}
                  onClick={onToggleReady}
                >
                  {isMeReady ? "I'M READY ✓" : "TAP TO READY ✕"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* =================================================================
            MODAL: HOW TO PLAY RULES
            ================================================================= */}
        {showRulesModal && (
          <div
            className="mm-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowRulesModal(false);
            }}
          >
            <div className="mm-modal-content">
              <div className="mm-modal-header">
                <h3 className="mm-modal-title">How to Play</h3>
                <button
                  className="mm-modal-close"
                  onClick={() => setShowRulesModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="mm-rules-text">
                <p>
                  <strong>1. Roll & Move:</strong> Roll two dice and move your
                  pawn around the board. Passing GO earns you $200.
                </p>
                <p>
                  <strong>2. Properties:</strong> Land on unowned properties to
                  buy them. If another player owns it, you pay rent!
                </p>
                <p>
                  <strong>3. Monopolies:</strong> Own all properties in a color
                  group to double rent and start building houses and hotels.
                </p>
                <p>
                  <strong>4. Special Tiles:</strong> Chance & Community Chest
                  cards, Income Tax, Free Parking jackpot, and Jail.
                </p>
                <p>
                  <strong>5. Victory:</strong> The last player standing wins!
                  Bankrupt your opponents by collecting massive rents.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
