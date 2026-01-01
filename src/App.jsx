import { useState, useEffect, useRef } from 'react';
import { 
  bottomRow, 
  leftColumn, 
  topRow, 
  rightColumn, 
  corners, 
  players,
  SPACE_TYPES
} from './data/boardData';
import './App.css';
import startIcon from './assets/start.png';
import parkingIcon from './assets/parking.png';
import robBankIcon from './assets/robbank.png';
import jailIcon from './assets/jail.png';
import './pawn.css';
import './safe_animation.css';
import './upgrades.css';
import { RENT_DATA, TRAIN_RENT, TRAIN_TILES } from './data/rentData';
import { CHANCE_CARDS } from './data/chanceCards';
import { CHEST_CARDS } from './data/chestCards';
import cashRegisterSound from './sounds/cash_register.mp3';
import './App.css';

function App() {
  const [diceValues, setDiceValues] = useState([6, 6]);
  const [isRolling, setIsRolling] = useState(false);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false); // New flag to prevent double turns
  const [turnFinished, setTurnFinished] = useState(false); // New flag for manual turn end
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [history, setHistory] = useState(['Player 3 starts turn']);
  const [playerPositions, setPlayerPositions] = useState([0, 0, 0, 0]);
  const [hoppingPlayer, setHoppingPlayer] = useState(null);
  
  // Property ownership: { tileIndex: playerIndex } - null means unowned
  const [propertyOwnership, setPropertyOwnership] = useState({});
  
  // Property levels: { tileIndex: level } - 0=Base, 1-4=Houses, 5=Hotel
  const [propertyLevels, setPropertyLevels] = useState({});
  
  // Buying modal state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyingProperty, setBuyingProperty] = useState(null);
  
  // Parking modal state
  const [showParkingModal, setShowParkingModal] = useState(false);



  // Property Details/Upgrade Modal state
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  
  // Train Travel state
  const [travelMode, setTravelMode] = useState(false);
  const [travelSourceIndex, setTravelSourceIndex] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Chance Card Modal state
  const [showChanceModal, setShowChanceModal] = useState(false);
  const [currentChanceCard, setCurrentChanceCard] = useState(null);
  const [showChestModal, setShowChestModal] = useState(false);
  const [currentChestCard, setCurrentChestCard] = useState(null);
  
  // Inventory State (Immunity cards, etc.)
  // Structure: { playerIndex: { jail_card: 0, robbery_immunity: 0, tax_immunity: 0 } }
  const [playerInventory, setPlayerInventory] = useState({});
  
  // Active Effects State (Discounts, etc.)
  // Structure: { playerIndex: { discount_50: false } }
  const [activeEffects, setActiveEffects] = useState({});
  
  // Cash Stack (The Pot) - Collects all fines/fees
  const [cashStack, setCashStack] = useState(0);
  
  // Property War State
  const [showWarModal, setShowWarModal] = useState(false);
  const [warPhase, setWarPhase] = useState('idle'); // 'idle', 'join', 'progress', 'reveal', 'roll', 'result'
  const [warParticipants, setWarParticipants] = useState([]);
  const [warProperty, setWarProperty] = useState(null);
  const [warRolls, setWarRolls] = useState({});
  const [battlePot, setBattlePot] = useState(0);
  const [warMode, setWarMode] = useState('A'); // 'A' = Standard War, 'B' = Cash Battle
  const [warCurrentRoller, setWarCurrentRoller] = useState(null); // Index in participants array
  const [warDiceValues, setWarDiceValues] = useState([1, 1]);
  const [warIsRolling, setWarIsRolling] = useState(false);

  // Initialize inventory and effects
  useEffect(() => {
    const initialInventory = {};
    const initialEffects = {};
    players.forEach((_, idx) => {
      initialInventory[idx] = { jail_card: 0, robbery_immunity: 0, tax_immunity: 0 };
      initialEffects[idx] = { discount_50: false };
    });
    setPlayerInventory(initialInventory);
    setActiveEffects(initialEffects);
  }, []);
  
  // Modal closing animation state
  const [isModalClosing, setIsModalClosing] = useState(false);
  
  // Skip turn state { playerIndex: boolean }
  const [skippedTurns, setSkippedTurns] = useState({});

  // Rob Bank State
  const [showRobBankModal, setShowRobBankModal] = useState(false);
  const [robProgress, setRobProgress] = useState(0);
  const [robStatus, setRobStatus] = useState('idle'); // 'idle', 'robbing', 'success', 'caught'
  const [robResult, setRobResult] = useState({ amount: 0, message: '' });
  
  // Debug Dice State
  const [debugDiceValue, setDebugDiceValue] = useState(7);

  // Helper: Close any modal with animation
  const closeAllModals = (callback, keepBuyingState = false) => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowBuyModal(false);
      if (!keepBuyingState) {
        setBuyingProperty(null);
      }
      setShowParkingModal(false);
      setShowRobBankModal(false);
      setShowPropertyModal(false);
      setSelectedProperty(null);
      setShowChanceModal(false);
      setShowChestModal(false);
      setRobStatus('idle'); // Reset status
      setIsModalClosing(false);
      if (callback) callback();
    }, 300); // 300ms matches CSS animation duration
  };

  // Floating price animation state - array to support multiple animations
  const [floatingPrices, setFloatingPrices] = useState([]); // [{ price, tileIndex, key, isPositive }]
  
  // Unique key generator for floating prices to prevent duplicate React keys
  const floatingKeyCounter = useRef(0);
  const getUniqueKey = () => {
    floatingKeyCounter.current += 1;
    return `fp_${Date.now()}_${floatingKeyCounter.current}`;
  };
  
  // Player money state (mutable copy of initial data)
  const [playerMoney, setPlayerMoney] = useState(players.map(p => p.money));

  // Clear floating prices on mount to remove any stale state with duplicate keys
  useEffect(() => {
    setFloatingPrices([]);
    setCashStackFloatingPrices([]);
  }, []);

  // Cash Stack Floating Prices State
  const [cashStackFloatingPrices, setCashStackFloatingPrices] = useState([]);

  const showCashStackFloatingPrice = (amount) => {
    const key = `cs_fp_${Date.now()}_${Math.random()}`;
    setCashStackFloatingPrices(prev => [...prev, { key, amount }]);

    // Remove after animation
    setTimeout(() => {
      setCashStackFloatingPrices(prev => prev.filter(item => item.key !== key));
    }, 3000);
  };

  // Helper to get property info by tile index
  const getPropertyByTileIndex = (tileIndex) => {
    // Corners and Robber are not properties
    if (tileIndex === 0 || tileIndex === 10 || tileIndex === 18 || tileIndex === 28 || tileIndex === 26) {
      return null;
    }
    
    let property = null;
    
    if (tileIndex > 0 && tileIndex < 10) {
      property = bottomRow[tileIndex - 1];
    } else if (tileIndex > 10 && tileIndex < 18) {
      property = leftColumn[tileIndex - 11];
    } else if (tileIndex > 18 && tileIndex < 28) {
      property = topRow[tileIndex - 19];
    } else if (tileIndex > 28 && tileIndex < 36) {
      property = rightColumn[tileIndex - 29];
    }
    
    // Only return buyable properties (not Chance, Tax, etc.)
    if (property && (property.type === SPACE_TYPES.PROPERTY || property.type === SPACE_TYPES.RAILROAD || property.type === SPACE_TYPES.UTILITY)) {
      // Calculate rent (simplified: 10% of price)
      const rent = property.price ? Math.round(property.price * 0.1) : 0;
      return { ...property, tileIndex, rent };
    }
    
    return null;
  };

  // Helper to get owner's color for a tile (returns null if unowned)
  // Returns { bgColor, textColor } for owned properties
  const getOwnerStyle = (tileIndex) => {
    const ownerIndex = propertyOwnership[tileIndex];
    if (ownerIndex !== undefined && players[ownerIndex]) {
      const bgColor = players[ownerIndex].color;
      // Use dark text for light backgrounds (white player)
      const isLightBg = bgColor === '#E0E0E0' || bgColor === '#FFFFFF';
      return { 
        bgColor, 
        textColor: isLightBg ? '#333333' : '#FFFFFF',
        level: propertyLevels[tileIndex] || 0
      };
    }
    return null;
  };

  // Helper: Check for Monopoly
  const hasMonopoly = (tileIndex, ownerIndex) => {
    const property = RENT_DATA[tileIndex];
    if (!property) return false;
    
    const groupId = property.groupId;
    
    // Find all tiles in this group
    const groupTiles = Object.keys(RENT_DATA).filter(key => RENT_DATA[key].groupId === groupId);
    
    // Check if owner owns all of them
    return groupTiles.every(tIndex => propertyOwnership[tIndex] === ownerIndex);
  };

  // Helper: Calculate Rent
  const calculateRent = (tileIndex) => {
    // 1. Check if it's a Train
    if (TRAIN_TILES.includes(tileIndex)) {
      const ownerIndex = propertyOwnership[tileIndex];
      if (ownerIndex === undefined) return 0;
      
      // Count trains owned by this player
      const ownedTrains = TRAIN_TILES.filter(t => propertyOwnership[t] === ownerIndex).length;
      return TRAIN_RENT[ownedTrains - 1] || 0;
    }
    
    // 2. Regular Property
    const property = RENT_DATA[tileIndex];
    if (!property) return 0; // Should not happen for valid properties
    
    const level = propertyLevels[tileIndex] || 0;
    const ownerIndex = propertyOwnership[tileIndex];
    
    // Check Monopoly (only relevant if level is 0)
    if (level === 0 && hasMonopoly(tileIndex, ownerIndex)) {
      return property.rentLevels[0] * 2;
    }
    
    return property.rentLevels[level];
  };

  // Helper to get tile name for history
  const getTileName = (index) => {
    if (index === 0) return 'START';
    if (index === 10) return 'PARKING';
    if (index === 18) return 'ROB BANK';
    if (index === 28) return 'JAIL';
    
    if (index > 0 && index < 10) return bottomRow[index - 1].name;
    if (index > 10 && index < 18) return leftColumn[index - 11].name;
    if (index > 18 && index < 28) return topRow[index - 19].name;
    if (index > 28 && index < 36) return rightColumn[index - 29].name;
    return 'Unknown';
  };

  // New helper for delay
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Audio context for sound effects
  const audioContextRef = useRef(null);
  
  // Initialize AudioContext lazily
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  
  // Modern "Tick" Sound for Hopping
  const playHopSound = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      
      // Layer 1: High click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
      
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      
      osc.start(t);
      osc.stop(t + 0.05);
      
      // Layer 2: Noise burst (texture)
      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();
      
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      
      noiseGain.gain.setValueAtTime(0.05, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      
      noise.start(t);
    } catch (e) {}
  };
  
  // Modern Dice Roll (Softer Shuffling)
  const playDiceRollSound = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      
      // Create noise buffer (Pinkish noise for softer sound)
      const bufferSize = ctx.sampleRate * 0.6;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      // Simple pinking filter (1/f)
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // Compensate for gain
        b6 = white * 0.115926;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      // Lowpass to remove harshness
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, t);
      
      const gain = ctx.createGain();
      
      // Rhythmic amplitude modulation
      gain.gain.setValueAtTime(0, t);
      for(let i=0; i<6; i++) {
        // Smoother ramps
        gain.gain.linearRampToValueAtTime(0.25, t + i*0.1 + 0.02);
        gain.gain.linearRampToValueAtTime(0.05, t + i*0.1 + 0.08);
      }
      gain.gain.linearRampToValueAtTime(0, t + 0.6);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start(t);
    } catch (e) {}
  };
  
  // Custom Cash Register Sound (File)
  const playBuySound = () => {
    try {
      const audio = new Audio(cashRegisterSound);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed', e));
    } catch (e) {}
  };
  
  // Custom Cash Register Sound (Rent/Deducting)
  const playPayRentSound = () => {
    try {
      const audio = new Audio(cashRegisterSound);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed', e));
    } catch (e) {}
  };
  
  // Modern Collect Money (Cash Counter - Receiving)
  const playCollectMoneySound = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      
      // Rapid "counting" sound (ascending pitch for receiving)
      for (let i = 0; i < 10; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        // Crisp "bill count" sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200 + (i * 50), t + i * 0.03);
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, t + i * 0.03);
        
        gain.gain.setValueAtTime(0, t + i * 0.03);
        gain.gain.linearRampToValueAtTime(0.08, t + i * 0.03 + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.025);
        
        osc.start(t + i * 0.03);
        osc.stop(t + i * 0.03 + 0.025);
      }
      
      // Final "Success" chime
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t + 0.35); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.4); // A6
        
        gain.gain.setValueAtTime(0.1, t + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        
        osc.start(t + 0.35);
        osc.stop(t + 0.8);
      }, 350);
      
    } catch (e) {}
  };
  
  // Modern Win (Ethereal Chord)
  const playWinSound = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      
      // Major 9th chord
      const notes = [261.63, 329.63, 392.00, 493.88, 587.33]; // C4, E4, G4, B4, D5
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth'; // Richer tone
        osc.frequency.setValueAtTime(freq, t);
        
        // Filter sweep
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.exponentialRampToValueAtTime(2000, t + 0.2);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Long tail
        
        osc.start(t);
        osc.stop(t + 1.5);
      });
    } catch (e) {}
  };
  
  // Modern Click (Subtle Tap)
  const playClickSound = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(600, t);
      
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      
      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  };
  
  // Modern Error (Low Buzz)
  const playErrorSound = () => {
    try {
      const ctx = getAudioContext();
      const t = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.linearRampToValueAtTime(80, t + 0.2);
      
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      
      osc.start(t);
      osc.stop(t + 0.2);
    } catch (e) {}
  };

  // Async function to move pawn step-by-step
  const movePlayerToken = async (playerIdx, steps, delay = 300) => {
    const startPos = playerPositions[playerIdx];
    const direction = steps > 0 ? 1 : -1;
    const count = Math.abs(steps);
    
    setHoppingPlayer(playerIdx); // Enable hop animation

    for (let i = 1; i <= count; i++) {
      // 1. Update position
      setPlayerPositions(prev => {
        const newPositions = [...prev];
        // Handle wrapping correctly for both directions
        const nextPos = (startPos + (i * direction) + 36) % 36;
        newPositions[playerIdx] = nextPos;
        
        // Check for GO (passing index 0)
        if (nextPos === 0 && direction > 0) {
             setPlayerMoney(moneyPrev => {
               const moneyUpdated = [...moneyPrev];
               moneyUpdated[playerIdx] += 1000;
               return moneyUpdated;
             });
             playCollectMoneySound(); // Play money sound for GO
             setFloatingPrices(fpPrev => [...fpPrev, { price: 1000, tileIndex: 0, key: Date.now(), isPositive: true }]);
             setHistory(histPrev => [`${players[playerIdx].name} passed GO! Collect $1000`, ...histPrev.slice(0, 9)]);
        }
        
        return newPositions;
      });

      // 2. Play hop sound
      playHopSound();

      // 3. Wait for animation to complete
      await wait(delay); // Sync with CSS transition/animation duration
    }
    
    setHoppingPlayer(null); // Disable hop animation
  };

  // Auto-skip logic (Optimized)
  // We don't need this useEffect anymore if we handle skipping in endTurn/setCurrentPlayer
  // But we might need it for the *first* turn or if logic is complex.
  // Better to use a helper to find the next valid player.
  
  const getNextValidPlayer = (currentIdx) => {
    let nextIdx = (currentIdx + 1) % players.length;
    let attempts = 0;
    while (skippedTurns[nextIdx] && attempts < players.length) {
      // Decrement skipped turn counter if we had one, or just toggle flag
      // Here we just have a boolean.
      // We should probably clear the flag when they are skipped.
      // But we can't easily update state in a sync loop without side effects.
      // So we will just skip them and let a useEffect clear it? 
      // Or better: Update skippedTurns state when we determine who plays next.
      nextIdx = (nextIdx + 1) % players.length;
      attempts++;
    }
    return nextIdx;
  };
  
  // We need to clear the skip flag for the players we skipped over.
  // This is tricky in a pure function.
  // Let's do it when we set the current player.

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent default for common keys to avoid scrolling
      if (['Space', 'Enter', 'Escape'].includes(e.code)) {
        // We handle preventDefault inside specific blocks to avoid blocking unrelated interactions if needed,
        // but for these keys in a game context, it's usually safe to block globally when handled.
      }

      // --- Modals First (Priority) ---

      // 1. Buy Modal
      if (showBuyModal) {
        if (e.code === 'Enter') {
          e.preventDefault();
          handleBuyProperty();
        } else if (e.code === 'Escape') {
          e.preventDefault();
          handleCancelBuy();
        }
        return;
      }

      // 2. Rob Bank Modal
      if (showRobBankModal) {
        if (robStatus === 'idle') {
          if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            handleRobBankAttempt();
          } else if (e.code === 'Escape') {
            e.preventDefault();
            // Cancel robbing: Close modal and allow turn end
            closeAllModals(() => {
              setIsProcessingTurn(false);
              setTurnFinished(true);
            });
          }
        } else if (robStatus === 'success' || robStatus === 'caught') {
          if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            handleRobBankComplete();
          }
        }
        return;
      }

      // 3. Parking Modal
      if (showParkingModal) {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleParkingConfirm();
        }
        return;
      }

      // 4. Property Detail Modal
      if (showPropertyModal) {
        if (e.code === 'Escape' || e.code === 'Space') {
          e.preventDefault();
          closeAllModals();
        }
        return;
      }

      // 5. Chance Modal
      if (showChanceModal) {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleChanceCardAction(currentChanceCard);
        }
        return;
      }

      // 6. Chest Modal
      if (showChestModal) {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          handleChestCardAction(currentChestCard);
        }
        return;
      }

      // 7. Property War Modal
      if (showWarModal) {
        if (warPhase === 'join') {
          // Enter or Space to start war
          if ((e.code === 'Enter' || e.code === 'Space') && warParticipants.length > 0) {
            e.preventDefault();
            handleWarStartProgress();
          }
          // Number keys 1-4 to toggle join/withdraw for each player
          if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3' || e.code === 'Digit4') {
            e.preventDefault();
            const playerIdx = parseInt(e.code.replace('Digit', '')) - 1;
            if (warParticipants.includes(playerIdx)) {
              // Already joined, withdraw
              handleWarWithdraw(playerIdx);
            } else if (playerMoney[playerIdx] >= (warMode === 'A' ? 3000 : 2000)) {
              // Not joined, join
              handleWarJoin(playerIdx);
            }
          }
        } else if (warPhase === 'roll') {
          if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            handleWarStartRolling();
          }
        } else if (warPhase === 'rolling' && !warIsRolling) {
          if (e.code === 'Space') {
            e.preventDefault();
            handleWarDoRoll();
          }
        } else if (warPhase === 'result') {
          if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            handleWarComplete();
          }
        }
        return;
      }

      // --- General Game Actions (No Modals) ---
      
      // Space to Roll or Finish Turn (only if no war modal)
      if (e.code === 'Space' && !showWarModal) {
        e.preventDefault();
        if (turnFinished) {
          handleEndTurn();
        } else if (!isRolling && !isProcessingTurn && !skippedTurns[currentPlayer]) {
          rollDice();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showBuyModal, showParkingModal, isRolling, isProcessingTurn, skippedTurns, currentPlayer, buyingProperty, 
    showWarModal, warPhase, warParticipants, warIsRolling, warMode, playerMoney,
    showRobBankModal, robStatus, showChanceModal, showChestModal, showPropertyModal, currentChanceCard, currentChestCard
  ]);

  // Helper to handle turn end (switch or stay for doubles)
  const endTurn = (movingPlayer, isDoubles) => {
    if (isDoubles) {
      setHistory(historyPrev => [
        `🎲 ${players[movingPlayer].name} rolled doubles! Extra turn!`,
        ...historyPrev.slice(0, 9)
      ]);
      // Unlock turn for next roll
      setIsProcessingTurn(false);
    } else {
      // Manual Turn End: Show "Done" button
      setTurnFinished(true);
      setIsProcessingTurn(false);
    }
  };

  // Handle Manual Turn End (Done Button Click)
  const handleEndTurn = () => {
    // Find next player who isn't skipped
    let nextIdx = (currentPlayer + 1) % players.length;
    let skippedPlayers = [];
    
    // Loop to find next valid player
    while (skippedTurns[nextIdx]) {
       skippedPlayers.push(nextIdx);
       nextIdx = (nextIdx + 1) % players.length;
       // Safety break
       if (nextIdx === currentPlayer) break; 
    }
    
    // Clear skipped flags for those we skipped
    if (skippedPlayers.length > 0) {
      setSkippedTurns(prev => {
        const updated = { ...prev };
        skippedPlayers.forEach(idx => updated[idx] = false);
        return updated;
      });
      setHistory(prev => [
        `🚫 Skipped: ${skippedPlayers.map(idx => players[idx].name).join(', ')}`, 
        ...prev.slice(0, 9)
      ]);
    }
    
    setCurrentPlayer(nextIdx);
    setTurnFinished(false);
    setBuyingProperty(null); // Ensure cleanup
  };

  // Smart Chance Card Selection
  const getSmartChanceCard = (playerIndex) => {
    // Filter cards based on context
    const validCards = CHANCE_CARDS.filter(card => {
      // 1. Repairs: Only if player has buildings
      if (card.action === 'REPAIRS') {
        let hasBuildings = false;
        Object.entries(propertyOwnership).forEach(([tileIdx, ownerIdx]) => {
          if (parseInt(ownerIdx) === playerIndex) {
            if ((propertyLevels[tileIdx] || 0) > 0) hasBuildings = true;
          }
        });
        return hasBuildings;
      }
      return true;
    });
    
    let selectedCard = { ...validCards[Math.floor(Math.random() * validCards.length)] };
    
    // Pre-calculate random values for movement cards and update text
    if (selectedCard.action === 'MOVE_FORWARD_RANDOM') {
      const steps = Math.floor(Math.random() * 10) + 1;
      selectedCard.steps = steps;
      selectedCard.text = `Take a ride! Move forward ${steps} spaces.`;
    } else if (selectedCard.action === 'MOVE_BACKWARD_RANDOM') {
      const steps = Math.floor(Math.random() * 10) + 1;
      selectedCard.steps = -steps;
      selectedCard.text = `Go back ${steps} spaces.`;
    } else if (selectedCard.action === 'MOVE_TO_RANDOM') {
      const currentPos = playerPositions[playerIndex];
      let randomTarget;
      do {
        randomTarget = Math.floor(Math.random() * 36);
      } while (randomTarget === currentPos);
      selectedCard.targetIndex = randomTarget;
      selectedCard.text = `Teleport! Advance to ${getTileName(randomTarget)}.`;
    }
    
    return selectedCard;
  };

  // Smart Chest Card Selection
  const getSmartChestCard = (playerIndex) => {
    const validCards = CHEST_CARDS.filter(card => {
      // 1. Debt Forgiveness: Only if player has negative money (debt)
      if (card.action === 'CLEAR_DEBT' || card.action === 'EXTEND_DEBT') {
        return playerMoney[playerIndex] < 0;
      }
      return true;
    });
    
    // If no valid cards (e.g. no debt), fallback to non-debt cards
    if (validCards.length === 0) {
      return CHEST_CARDS.filter(c => c.action !== 'CLEAR_DEBT' && c.action !== 'EXTEND_DEBT')[0];
    }
    
    return validCards[Math.floor(Math.random() * validCards.length)];
  };

  // Helper to process tile arrival (Rent, Buy, Special Tiles)
  const handleTileArrival = (playerIndex, tileIndex, isDoubles = false) => {
    // 1. Check Special Tiles
    // Parking (Index 10)
    if (tileIndex === 10) {
      setShowParkingModal(true);
      return; 
    }

    // Rob Bank (Index 18) - Mini Game
    if (tileIndex === 18) {
      setRobStatus('idle');
      setRobProgress(0);
      setRobResult({ amount: 0, message: '' });
      setShowRobBankModal(true);
      return;
    }

    // Property War (Index 26) - Initiate War Event
    if (tileIndex === 26) {
      // Check if any properties are unowned
      const allPropertyTiles = Object.keys(RENT_DATA).map(Number);
      const unownedProperties = allPropertyTiles.filter(t => propertyOwnership[t] === undefined);
      
      const mode = unownedProperties.length > 0 ? 'A' : 'B';
      setWarMode(mode);
      setWarPhase('join');
      setWarParticipants([]);
      setWarRolls({});
      setWarProperty(null);
      setBattlePot(0);
      setShowWarModal(true);
      
      setHistory(prev => [`⚔️ ${players[playerIndex].name} triggered PROPERTY WAR!`, ...prev.slice(0, 9)]);
      return;
    }
      


    // Chance Tiles (7, 23, 31)
    if (tileIndex === 7 || tileIndex === 23 || tileIndex === 31) {
      const randomCard = getSmartChanceCard(playerIndex);
      setCurrentChanceCard(randomCard);
      setShowChanceModal(true);
      return;
    }
    
    // Community Chest (Index 33 - in rightColumn)
    if (tileIndex === 33) {
      const randomCard = getSmartChestCard(playerIndex);
      setCurrentChestCard(randomCard);
      setShowChestModal(true);
      return;
    }
    
    // Cash Stack (Index 3) - Player wins the jackpot!
    if (tileIndex === 3) {
      if (cashStack > 0) {
        // Award entire pot to player
        setPlayerMoney(prev => {
          const updated = [...prev];
          updated[playerIndex] += cashStack;
          return updated;
        });
        
        const animKey = getUniqueKey();
        setFloatingPrices(prev => [...prev, { price: cashStack, tileIndex, key: animKey, isPositive: true }]);
        setTimeout(() => {
          setFloatingPrices(prev => prev.filter(fp => fp.key !== animKey));
        }, 3000);
        
        setHistory(prev => [`💰 ${players[playerIndex].name} won the Cash Stack: $${cashStack}!`, ...prev.slice(0, 9)]);
        playCollectMoneySound(); // Play money sound for Cash Stack
        showCashStackFloatingPrice(-cashStack); // Animate removal
        setCashStack(0); // Reset pot
      } else {
        setHistory(prev => [`${players[playerIndex].name} landed on Cash Stack, but it's empty!`, ...prev.slice(0, 9)]);
      }
      endTurn(playerIndex, isDoubles);
      return;
    }
    
    // 2. Check Property
    const property = getPropertyByTileIndex(tileIndex);
    const ownerIndex = propertyOwnership[tileIndex];
    
    if (property && ownerIndex === undefined) {
      // Unowned property - show buying modal
      const rentData = RENT_DATA[tileIndex];
      const rent = rentData ? rentData.rentLevels[0] : (property.rent || Math.floor(property.price * 0.1));
      
      setBuyingProperty({ ...property, rent, buyerIndex: playerIndex, isDoubles });
      setShowBuyModal(true);
    } else if (property && ownerIndex !== undefined && ownerIndex !== playerIndex) {
      // Owned by another player - pay rent!
      const rent = calculateRent(tileIndex);
      const ownerPosition = playerPositions[ownerIndex];
      
      // Deduct rent from current player
      setPlayerMoney(prev => {
        const updated = [...prev];
        updated[playerIndex] -= rent;
        updated[ownerIndex] += rent;
        return updated;
      });
      playPayRentSound(); // Play sad rent payment sound
      
      // Trigger dual floating price animations
      const animKey1 = getUniqueKey();
      const animKey2 = getUniqueKey();
      setFloatingPrices(prev => [
        ...prev, 
        { price: rent, tileIndex: tileIndex, key: animKey1, isPositive: false },
        { price: rent, tileIndex: ownerPosition, key: animKey2, isPositive: true }
      ]);
      setTimeout(() => {
        setFloatingPrices(prev => prev.filter(fp => fp.key !== animKey1 && fp.key !== animKey2));
      }, 3000);
      
      // Add to history
      setHistory(historyPrev => [
        `${players[playerIndex].name} paid $${rent} rent to ${players[ownerIndex].name}`,
        ...historyPrev.slice(0, 9)
      ]);
      
      // Handle turn end
      endTurn(playerIndex, isDoubles);
    } else if (property && ownerIndex === playerIndex) {
      // Player owns this property
      
      // Check for Train Travel
      const isTrain = TRAIN_TILES.includes(tileIndex);
      if (isTrain) {
        // Count owned trains
        const ownedTrains = TRAIN_TILES.filter(t => propertyOwnership[t] === playerIndex).length;
        if (ownedTrains > 1) {
          setHistory(prev => [`🚂 ${players[playerIndex].name} arrived at ${property.name}. Travel available?`, ...prev.slice(0, 9)]);
          // Offer Travel: Set state to show Travel button
          // We reuse buyingProperty with a flag to indicate this is a travel offer, not a buy offer
          setBuyingProperty({ ...property, isTravelOffer: true });
          setTurnFinished(true); // Allow ending turn if they don't want to travel
          setIsProcessingTurn(false); // Unlock buttons
          return;
        }
      }

      setHistory(prev => [`${players[playerIndex].name} arrived at their own ${property.name}. Welcome back!`, ...prev.slice(0, 9)]);
      endTurn(playerIndex, isDoubles);
    } else {
      // No action needed (e.g. non-action tile)
      endTurn(playerIndex, isDoubles);
    }
  };



  // Handle Rob Bank Attempt
  const handleRobBankAttempt = () => {
    setRobStatus('processing');
    setRobProgress(0);
    
    // Animate progress bar
    const duration = 2000; // 2 seconds
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min((currentStep / steps) * 100, 100);
      setRobProgress(progress);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        
        // Determine result (60% success)
        const isSuccess = Math.random() < 0.6;
        
        if (isSuccess) {
          // Success: Gain $1000 - $10000
          const amount = Math.floor(Math.random() * 9001) + 1000; // 1000 to 10000
          setRobResult({ amount, message: 'Success!' });
          setRobStatus('success');
        } else {
          // Failure: Go to Jail
          setRobResult({ amount: 0, message: 'Caught!' });
          setRobStatus('caught');
        }
      }
    }, interval);
  };

  // Handle Rob Bank Complete (Success or Failure)
  const handleRobBankComplete = async () => {
    const playerIndex = currentPlayer;
    
    if (robStatus === 'success') {
      // Add money
      setPlayerMoney(prev => {
        const updated = [...prev];
        updated[playerIndex] += robResult.amount;
        return updated;
      });
      
      // Floating Price
      const animKey = getUniqueKey();
      setFloatingPrices(prev => [
        ...prev, 
        { price: robResult.amount, tileIndex: 18, key: animKey, isPositive: true }
      ]);
      setTimeout(() => {
        setFloatingPrices(prev => prev.filter(fp => fp.key !== animKey));
      }, 3000);
      
      setHistory(prev => [`💰 ${players[playerIndex].name} robbed the bank for $${robResult.amount}!`, ...prev.slice(0, 9)]);
      
      closeAllModals(() => {
        endTurn(playerIndex, false); // No doubles on rob bank? Or preserve? Usually turn ends.
      });
      
    } else if (robStatus === 'caught') {
      // Go to Jail
      setHistory(prev => [`👮 ${players[playerIndex].name} was caught robbing the bank!`, ...prev.slice(0, 9)]);
      
      closeAllModals(async () => {
        // Move to Jail (Tile 28)
        // Simple teleport for now, or use movePlayerToken if we want animation
        // Let's use handleTileArrival logic for Jail? Or just set position.
        // Usually "Go to Jail" moves you directly.
        
        // We can use the same logic as "Go To Jail" chance card
        const jailIndex = 28;
        const currentPos = playerPositions[playerIndex];
        let stepsToJail = (jailIndex - currentPos + 36) % 36;
        if (stepsToJail === 0) stepsToJail = 0;
        
        if (stepsToJail > 0) {
           await movePlayerToken(playerIndex, stepsToJail, 50);
        }
        
        // Jail logic (if we had specific jail state, we'd set it here)
        // For now, just end turn at Jail.
        endTurn(playerIndex, false);
      });
    } else {
      // Cancelled (shouldn't happen here if button is only for success/caught)
      closeAllModals(() => endTurn(playerIndex, false));
    }
  };

  // Handle Chance Card Action
  const handleChanceCardAction = (card) => {
    if (!card) return;
    
    // Close modal first, then execute action with animation
    closeAllModals(async () => {
      const playerIndex = currentPlayer;
      const currentPos = playerPositions[playerIndex];
      
      switch (card.action) {
        case 'MONEY_ADD':
          setPlayerMoney(prev => {
            const updated = [...prev];
            console.log(`[DEBUG] Adding $${card.amount} to Player ${playerIndex}. Old: ${updated[playerIndex]}`);
            updated[playerIndex] += card.amount;
            console.log(`[DEBUG] New: ${updated[playerIndex]}`);
            return updated;
          });
          // Floating Price
          const animKeyAdd = getUniqueKey();
          setFloatingPrices(prev => [
            ...prev, 
            { price: card.amount, tileIndex: currentPos, key: animKeyAdd, isPositive: true }
          ]);
          setTimeout(() => {
            setFloatingPrices(prev => prev.filter(fp => fp.key !== animKeyAdd));
          }, 3000);
          setHistory(prev => [`${players[playerIndex].name} gained $${card.amount}: ${card.text}`, ...prev.slice(0, 9)]);
          break;
          
        case 'MONEY_SUBTRACT':
          setPlayerMoney(prev => {
            const updated = [...prev];
            updated[playerIndex] -= card.amount;
            return updated;
          });
          // Floating Price
          const animKeySub = getUniqueKey();
          setFloatingPrices(prev => [
            ...prev, 
            { price: card.amount, tileIndex: currentPos, key: animKeySub, isPositive: false }
          ]);
          setTimeout(() => {
            setFloatingPrices(prev => prev.filter(fp => fp.key !== animKeySub));
          }, 3000);
          setHistory(prev => [`${players[playerIndex].name} lost $${card.amount}: ${card.text}`, ...prev.slice(0, 9)]);
          break;
          
        case 'MOVE_TO':
          // Calculate steps
          const targetPos = card.targetIndex;
          let steps = (targetPos - currentPos + 36) % 36;
          if (steps === 0) steps = 36; // Full circle if same? Or 0? Usually 0.
          if (targetPos === currentPos) steps = 0;
          
          if (steps > 0) {
            await movePlayerToken(playerIndex, steps, 100); // Fast movement
          }
          
          // Check for passing start (if not going to jail)
          // Logic: If we moved forward and target < start (wrapped) OR target is 0
          // But movePlayerToken handles wrapping visually.
          // We need to know if we passed 0.
          // Simple check: if (currentPos + steps >= 36)
          if (currentPos + steps >= 36 && card.action !== 'GO_TO_JAIL') {
             setPlayerMoney(prev => {
               const updated = [...prev];
               updated[playerIndex] += 200;
               return updated;
             });
             const animKeyStart = getUniqueKey();
             setFloatingPrices(prev => [
                ...prev, 
                { price: 200, tileIndex: 0, key: animKeyStart, isPositive: true }
             ]);
             setTimeout(() => {
               setFloatingPrices(prev => prev.filter(fp => fp.key !== animKeyStart));
             }, 3000);
             setHistory(prev => [`${players[playerIndex].name} collected $200 for passing Start`, ...prev.slice(0, 9)]);
          }
          
          setHistory(prev => [`${players[playerIndex].name} moved to ${getTileName(targetPos)}`, ...prev.slice(0, 9)]);
          
          // Process arrival at new tile
          handleTileArrival(playerIndex, targetPos, false); // Assume no doubles for chance movement
          break;
          
        case 'MOVE_STEPS':
          await movePlayerToken(playerIndex, card.steps);
          const newPosSteps2 = (currentPos + card.steps + 36) % 36;
          setHistory(prev => [`${players[playerIndex].name} moved ${card.steps} steps`, ...prev.slice(0, 9)]);
          handleTileArrival(playerIndex, newPosSteps2, false);
          return;

        case 'MOVE_FORWARD_RANDOM':
          // Use pre-calculated steps from card
          await movePlayerToken(playerIndex, card.steps);
          const newPosFwd = (currentPos + card.steps + 36) % 36;
          setHistory(prev => [`${players[playerIndex].name} moved forward ${card.steps} spaces`, ...prev.slice(0, 9)]);
          handleTileArrival(playerIndex, newPosFwd, false);
          return;

        case 'MOVE_BACKWARD_RANDOM':
          // Use pre-calculated steps from card (already negative)
          await movePlayerToken(playerIndex, card.steps);
          const newPosBack = (currentPos + card.steps + 36) % 36;
          setHistory(prev => [`${players[playerIndex].name} moved back ${Math.abs(card.steps)} spaces`, ...prev.slice(0, 9)]);
          handleTileArrival(playerIndex, newPosBack, false);
          return;

        case 'MOVE_TO_RANDOM':
          // Use pre-calculated target from card
          const stepsToRandom = (card.targetIndex - currentPos + 36) % 36;
          await movePlayerToken(playerIndex, stepsToRandom);
          
          setHistory(prev => [`${players[playerIndex].name} teleported to ${getTileName(card.targetIndex)}`, ...prev.slice(0, 9)]);
          handleTileArrival(playerIndex, card.targetIndex, false);
          return;
          
        case 'GO_TO_JAIL':
          // Move fast to Jail
          // Calculate steps to Jail (28)
          const jailIndex = 28;
          let stepsToJail = (jailIndex - currentPos + 36) % 36;
          if (stepsToJail === 0) stepsToJail = 0;
          
          // Animate fast
          if (stepsToJail > 0) {
            await movePlayerToken(playerIndex, stepsToJail, 50); // Very fast
          }
          
          setHistory(prev => [`${players[playerIndex].name} went to Jail!`, ...prev.slice(0, 9)]);
          break;
          
        case 'REPAIRS':
          // Calculate cost
          let totalCost = 0;
          Object.entries(propertyOwnership).forEach(([tileIdx, ownerIdx]) => {
            if (parseInt(ownerIdx) === playerIndex) {
              const level = propertyLevels[tileIdx] || 0;
              if (level === 5) {
                totalCost += card.hotelCost;
              } else {
                totalCost += level * card.houseCost;
              }
            }
          });
          
          if (totalCost > 0) {
            setPlayerMoney(prev => {
              const updated = [...prev];
              updated[playerIndex] -= totalCost;
              return updated;
            });
            const animKeyRepairs = getUniqueKey();
            setFloatingPrices(prev => [
              ...prev, 
              { price: totalCost, tileIndex: currentPos, key: animKeyRepairs, isPositive: false }
            ]);
            setTimeout(() => {
              setFloatingPrices(prev => prev.filter(fp => fp.key !== animKeyRepairs));
            }, 3000);
            setHistory(prev => [`${players[playerIndex].name} paid $${totalCost} for repairs`, ...prev.slice(0, 9)]);
          } else {
             setHistory(prev => [`${players[playerIndex].name} has no buildings to repair`, ...prev.slice(0, 9)]);
          }
          break;
          
        case 'PAY_ALL_PLAYERS':
          const amount = card.amount;
          const numOtherPlayers = players.length - 1;
          const totalDeduction = amount * numOtherPlayers;
          
          setPlayerMoney(prev => {
            const updated = [...prev];
            updated[playerIndex] -= totalDeduction;
            players.forEach((_, idx) => {
              if (idx !== playerIndex) {
                updated[idx] += amount;
              }
            });
            return updated;
          });
          const animKeyPayAll = getUniqueKey();
          setFloatingPrices(prev => [
            ...prev, 
            { price: totalDeduction, tileIndex: currentPos, key: animKeyPayAll, isPositive: false }
          ]);
          setTimeout(() => {
            setFloatingPrices(prev => prev.filter(fp => fp.key !== animKeyPayAll));
          }, 3000);
          setHistory(prev => [`${players[playerIndex].name} paid $${amount} to each player`, ...prev.slice(0, 9)]);
          break;
          
        case 'MOVE_STEPS':
          await movePlayerToken(playerIndex, card.steps);
          const newPosSteps = (currentPos + card.steps + 36) % 36;
          setHistory(prev => [`${players[playerIndex].name} moved ${card.steps} steps`, ...prev.slice(0, 9)]);
          handleTileArrival(playerIndex, newPosSteps, false);
          // Note: handleTileArrival calls endTurn, so we don't need to call it here if we return
          return;

        default:
          break;
      }
      
      // Use endTurn to handle skipping logic
      endTurn(currentPlayer, false); // Assume no doubles for chance movement end
    });
  };

  // Handle Chest Card Action
  const handleChestCardAction = (card) => {
    if (!card) return;
    
    closeAllModals(async () => {
      const playerIndex = currentPlayer;
      const currentPos = playerPositions[playerIndex];
      
      switch (card.action) {
        case 'ADD_INVENTORY':
          setPlayerInventory(prev => ({
            ...prev,
            [playerIndex]: {
              ...prev[playerIndex],
              [card.type]: (prev[playerIndex]?.[card.type] || 0) + 1
            }
          }));
          setHistory(prev => [`${players[playerIndex].name} got ${card.text}`, ...prev.slice(0, 9)]);
          break;
          
        case 'ADD_EFFECT':
          setActiveEffects(prev => ({
            ...prev,
            [playerIndex]: {
              ...prev[playerIndex],
              [card.type]: true
            }
          }));
          setHistory(prev => [`${players[playerIndex].name} activated: ${card.text}`, ...prev.slice(0, 9)]);
          break;
          
        case 'CLEAR_DEBT':
          setPlayerMoney(prev => {
            const updated = [...prev];
            if (updated[playerIndex] < 0) {
              updated[playerIndex] = 0;
              setHistory(prev => [`${players[playerIndex].name}'s debt was cleared!`, ...prev.slice(0, 9)]);
            } else {
               setHistory(prev => [`${players[playerIndex].name} has no debt to clear`, ...prev.slice(0, 9)]);
            }
            return updated;
          });
          break;
          
        case 'EXTEND_DEBT':
           setHistory(prev => [`${players[playerIndex].name} got Debt Extension (Not Implemented)`, ...prev.slice(0, 9)]);
           break;

        default:
          break;
      }
      
      endTurn(currentPlayer, false);
    });
  };



  // Debug: Test Chance Card
  const handleTestChance = () => {
    const randomCard = getSmartChanceCard(currentPlayer);
    setCurrentChanceCard(randomCard);
    setShowChanceModal(true);
  };
  
  // Debug: Test Chest Card
  const handleTestChest = () => {
    const randomCard = CHEST_CARDS[Math.floor(Math.random() * CHEST_CARDS.length)];
    setCurrentChestCard(randomCard);
    setShowChestModal(true);
  };

  // Handle dice roll
  const rollDice = async (overrideValue = null) => {
    if (isRolling || isProcessingTurn || skippedTurns[currentPlayer]) return; // Prevent rolling if skipped or busy
    
    setIsRolling(true);
    setIsProcessingTurn(true); // Lock turn start
    playDiceRollSound(); // Play dice rattle sound

    // 1. Roll Animation (1s)
    const rollDuration = 1000;
    const intervalTime = 80;
    
    const rollInterval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, intervalTime);

    // Wait for roll to finish
    await wait(rollDuration);
    clearInterval(rollInterval);

    // 2. Determine Result
    let die1, die2;
    
    if (overrideValue) {
      // Force specific roll
      die1 = Math.floor(overrideValue / 2);
      die2 = overrideValue - die1;
    } else {
      // Random roll
      die1 = Math.floor(Math.random() * 6) + 1;
      die2 = Math.floor(Math.random() * 6) + 1;
    }

    const moveAmount = die1 + die2;

    setDiceValues([die1, die2]);
    
    // 3. Start Movement Animation
    const movingPlayer = currentPlayer;
    
    await movePlayerToken(movingPlayer, moveAmount);

    // 4. Finish Turn
    const finalPos = (playerPositions[movingPlayer] + moveAmount) % 36;
    const tileName = getTileName(finalPos);
    
    setHistory(historyPrev => [
      `${players[movingPlayer].name} rolled ${moveAmount} → ${tileName}`, 
      ...historyPrev.slice(0, 9)
    ]);

    setIsRolling(false);
    
    // Check for doubles (same dice = extra turn)
    const isDoubles = die1 === die2;
    
    // 5. Process Tile Arrival
    handleTileArrival(movingPlayer, finalPos, isDoubles);
  };

  // Handle buying a property
  const handleBuyProperty = () => {
    if (!buyingProperty) return;
    
    const { tileIndex, price, buyerIndex } = buyingProperty;
    
    // Check if player has enough money
    let finalPrice = price;
    
    // Check for 50% Discount
    if (activeEffects[buyerIndex]?.discount_50) {
      finalPrice = Math.floor(price / 2);
      setHistory(prev => [`🏷️ ${players[buyerIndex].name} used 50% Discount!`, ...prev.slice(0, 9)]);
      
      // Consume discount
      setActiveEffects(prev => ({
        ...prev,
        [buyerIndex]: { ...prev[buyerIndex], discount_50: false }
      }));
    }

    if (playerMoney[buyerIndex] >= finalPrice) {
      // Deduct money
      setPlayerMoney(prev => {
        const updated = [...prev];
        updated[buyerIndex] -= finalPrice;
        return updated;
      });
      
      // Set ownership
      setPropertyOwnership(prev => ({
        ...prev,
        [tileIndex]: buyerIndex
      }));
      playBuySound(); // Play purchase sound
      
      // Trigger floating price animation (negative/red for buyer)
      const animKey = Date.now();
      setFloatingPrices(prev => [...prev, { price: finalPrice, tileIndex, key: animKey, isPositive: false }]);
      setTimeout(() => {
        setFloatingPrices(prev => prev.filter(fp => fp.key !== animKey));
      }, 3000);
      
      // Add to history
      setHistory(historyPrev => [
        `${players[buyerIndex].name} bought ${buyingProperty.name} for $${finalPrice}`,
        ...historyPrev.slice(0, 9)
      ]);
    }
    

    
    // Check if doubles - add extra turn message
    const isDoubles = buyingProperty?.isDoubles;
    
    // Close modal with animation
    closeAllModals(() => {
      if (isDoubles) {
        setHistory(historyPrev => [
          `🎲 ${players[buyerIndex].name} rolled doubles! Extra turn!`,
          ...historyPrev.slice(0, 9)
        ]);
        // Unlock turn for next roll
        setIsProcessingTurn(false);
      } else {
        setTimeout(() => {
          endTurn(buyerIndex, false);
        }, 300);
      }
    });
  };

  // Handle canceling a purchase
  const handleCancelBuy = () => {
    const buyerIndex = buyingProperty?.buyerIndex;
    const isDoubles = buyingProperty?.isDoubles;
    
    // Pass true to keepBuyingState so the button remains available
    console.log('[DEBUG] handleCancelBuy called. Preserving buyingProperty.');
    closeAllModals(() => {
      if (isDoubles && buyerIndex !== undefined) {
        setHistory(historyPrev => [
          `🎲 ${players[buyerIndex].name} rolled doubles! Extra turn!`,
          ...historyPrev.slice(0, 9)
        ]);
        // Unlock turn
        setIsProcessingTurn(false);
      } else {
        setTimeout(() => {
          // Do NOT end turn yet, let user decide via Done or Buy button
          // But we need to unlock processing so buttons work
          console.log('[DEBUG] handleCancelBuy timeout. Setting turnFinished=true');
          setIsProcessingTurn(false);
          setTurnFinished(true); // Show Done button
        }, 300);
      }
    }, true);
  };

  // Handle Parking Confirm
  const handleParkingConfirm = () => {
    // Mark player to skip next turn
    setSkippedTurns(prev => ({ ...prev, [currentPlayer]: true }));
    
    closeAllModals(() => {
      setTimeout(() => {
        endTurn(currentPlayer, false);
      }, 300);
    });
  };

  // --- Property War Handlers ---
  const handleWarJoin = (playerIdx) => {
    const fee = warMode === 'A' ? 3000 : 2000;
    
    // Deduct fee
    setPlayerMoney(prev => {
      const updated = [...prev];
      updated[playerIdx] -= fee;
      return updated;
    });
    
    // Add fee to appropriate pot
    if (warMode === 'A') {
      setCashStack(prev => prev + fee);
      showCashStackFloatingPrice(fee); // Animate addition
    } else {
      setBattlePot(prev => prev + fee);
    }
    
    // Add to participants
    setWarParticipants(prev => [...prev, playerIdx]);
    setHistory(prev => [`${players[playerIdx].name} joined the war! (-$${fee})`, ...prev.slice(0, 9)]);
  };
  
  const handleWarRetreat = (playerIdx) => {
    setHistory(prev => [`${players[playerIdx].name} retreated from the war.`, ...prev.slice(0, 9)]);
  };
  
  const handleWarWithdraw = (playerIdx) => {
    const fee = warMode === 'A' ? 3000 : 2000;
    
    // Refund fee
    setPlayerMoney(prev => {
      const updated = [...prev];
      updated[playerIdx] += fee;
      return updated;
    });
    
    // Remove from pot
    if (warMode === 'A') {
      setCashStack(prev => prev - fee);
      showCashStackFloatingPrice(-fee); // Animate removal
    } else {
      setBattlePot(prev => prev - fee);
    }
    
    // Remove from participants
    setWarParticipants(prev => prev.filter(p => p !== playerIdx));
    setHistory(prev => [`${players[playerIdx].name} withdrew from the war. (+$${fee} refund)`, ...prev.slice(0, 9)]);
  };
  
  const handleWarStartProgress = () => {
    if (warMode === 'A') {
      setWarPhase('progress');
      // Progress bar for 3 seconds, then reveal property
      setTimeout(() => {
        handleWarReveal();
      }, 3000);
    } else {
      // Mode B: Skip progress, go to roll
      setWarPhase('roll');
    }
  };
  
  const handleWarReveal = () => {
    // Select random unowned property - must check propertyOwnership properly
    const allPropertyTiles = Object.keys(RENT_DATA).map(Number);
    const unownedProperties = allPropertyTiles.filter(t => {
      const owner = propertyOwnership[t];
      return owner === undefined || owner === null;
    });
    
    if (unownedProperties.length === 0) {
      // No unowned properties, shouldn't happen in Mode A but safety check
      setHistory(prev => [`No unowned properties available!`, ...prev.slice(0, 9)]);
      setWarPhase('result');
      return;
    }
    
    const randomProperty = unownedProperties[Math.floor(Math.random() * unownedProperties.length)];
    const propertyData = RENT_DATA[randomProperty];
    
    setWarProperty({ ...propertyData, tileIndex: randomProperty });
    setWarPhase('reveal');
    setHistory(prev => [`⚔️ "${propertyData.name}" is chosen for war!`, ...prev.slice(0, 9)]);
    
    // Auto-advance to roll after 2 seconds
    setTimeout(() => {
      setWarPhase('roll');
    }, 2000);
  };
  
  // Start the rolling sequence
  const handleWarStartRolling = () => {
    if (warParticipants.length === 0) {
      setHistory(prev => [`No one joined the war. It fizzles out.`, ...prev.slice(0, 9)]);
      setWarPhase('result');
      return;
    }
    setWarCurrentRoller(0); // Start with first participant
    setWarRolls({});
    setWarPhase('rolling');
  };
  
  // Roll for current participant
  const handleWarDoRoll = () => {
    if (warCurrentRoller === null || warCurrentRoller >= warParticipants.length) return;
    
    const playerIdx = warParticipants[warCurrentRoller];
    setWarIsRolling(true);
    
    // Animate dice for 1 second
    const rollInterval = setInterval(() => {
      setWarDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 100);
    
    setTimeout(() => {
      clearInterval(rollInterval);
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      const total = die1 + die2;
      
      setWarDiceValues([die1, die2]);
      setWarIsRolling(false);
      
      // Build complete rolls object (include this roll)
      const updatedRolls = { ...warRolls, [playerIdx]: total };
      setWarRolls(updatedRolls);
      setHistory(prev => [`🎲 ${players[playerIdx].name} rolled ${total}!`, ...prev.slice(0, 9)]);
      
      // Move to next roller or show results
      if (warCurrentRoller + 1 < warParticipants.length) {
        setWarCurrentRoller(warCurrentRoller + 1);
      } else {
        // All done, show results - pass the complete rolls object!
        setTimeout(() => {
          handleWarShowResults(updatedRolls);
        }, 500);
      }
    }, 1000);
  };
  
  // Show results and determine winner (rolls passed directly to avoid stale state)
  const handleWarShowResults = (rolls) => {
    const maxRoll = Math.max(...Object.values(rolls));
    
    // Find all players with max roll (for tie-breaking)
    const winners = Object.entries(rolls).filter(([_, roll]) => roll === maxRoll);
    
    if (winners.length > 1) {
      // TIE! Need to re-roll between tied players
      const tiedPlayers = winners.map(([idx]) => parseInt(idx));
      setHistory(prev => [`⚔️ TIE! ${tiedPlayers.map(idx => players[idx].name).join(' vs ')} will re-roll!`, ...prev.slice(0, 9)]);
      
      // Reset for re-roll with only tied players
      setWarParticipants(tiedPlayers);
      setWarRolls({});
      setWarCurrentRoller(0);
      setWarPhase('rolling');
      return;
    }
    
    // Single winner
    const winnerIdx = parseInt(winners[0][0]);
    
    if (warMode === 'A' && warProperty) {
      // Winner gets property for free
      const tileIdx = Number(warProperty.tileIndex);
      setPropertyOwnership(prev => ({
        ...prev,
        [tileIdx]: winnerIdx
      }));
      setHistory(prev => [`🏆 ${players[winnerIdx].name} won "${warProperty.name}" in the Property War!`, ...prev.slice(0, 9)]);
      playWinSound(); // Play victory fanfare
    } else {
      // Mode B: Winner gets battlePot
      setPlayerMoney(prev => {
        const updated = [...prev];
        updated[winnerIdx] += battlePot;
        return updated;
      });
      setHistory(prev => [`🏆 ${players[winnerIdx].name} won the Cash Battle! (+$${battlePot})`, ...prev.slice(0, 9)]);
      playWinSound(); // Play victory fanfare
    }
    
    setWarPhase('result');
  };
  
  const handleWarComplete = () => {
    setShowWarModal(false);
    setWarPhase('idle');
    endTurn(currentPlayer, false);
  };

  // Handle Travel Start
  const handleTravelStart = () => {
    setTravelMode(true);
    setTravelSourceIndex(playerPositions[currentPlayer]);
    setHistory(prev => [`Select a train station to travel to...`, ...prev.slice(0, 9)]);
    // Close any open modals (like the "Buy/Travel" prompt if it was a modal, or just the button state)
    setBuyingProperty(null); 
  };

  // Handle Travel Confirmation (Move and Pay)
  const handleTravelConfirm = async (targetIndex, cost) => {
    setTravelMode(false);
    setTravelSourceIndex(null);
    
    // Deduct cost
    setPlayerMoney(prev => {
      const updated = [...prev];
      updated[currentPlayer] -= cost;
      return updated;
    });
    
    // Animate cost
    const animKey = getUniqueKey();
    setFloatingPrices(prev => [...prev, { price: cost, tileIndex: playerPositions[currentPlayer], key: animKey, isPositive: false }]);
    setTimeout(() => setFloatingPrices(prev => prev.filter(fp => fp.key !== animKey)), 3000);
    
    setHistory(prev => [`${players[currentPlayer].name} traveled to ${getTileName(targetIndex)} for $${cost}`, ...prev.slice(0, 9)]);
    
    // Move player
    await movePlayerToken(currentPlayer, 0); // Reset? No, move from current.
    // Calculate steps? No, just teleport or move fast? 
    // "Travel" implies movement. Let's use movePlayerToken with calculated steps or just direct update?
    // User said "travel to any other train... costing 50$ per train he passes through".
    // This implies movement along the board.
    
    const currentPos = playerPositions[currentPlayer];
    const steps = (targetIndex - currentPos + 36) % 36;
    await movePlayerToken(currentPlayer, steps, 50); // Fast travel
    
    // Handle arrival at new station (don't trigger rent/buy/travel again?)
    // Usually travel ends turn.
    handleTileArrival(currentPlayer, targetIndex, false); 
  };

  // Handle Tile Click (Open Property Details OR Select Travel Destination)
  const handleTileClick = (tileIndex) => {
    // If in Travel Mode
    if (travelMode) {
      // Check if valid target (Train, Owned by player, Not current)
      const isTrain = TRAIN_TILES.includes(tileIndex);
      const isOwnedByMe = propertyOwnership[tileIndex] === currentPlayer;
      const isCurrent = tileIndex === travelSourceIndex;
      
      if (isTrain && isOwnedByMe && !isCurrent) {
        // Calculate Cost
        // Count trains passed. 
        // TRAIN_TILES = [4, 12, 19, 29] (sorted)
        // Find index of source and target in TRAIN_TILES array
        // But wait, "passes through" might mean board segments or just train stations passed?
        // "costing 50$ per train he passes through"
        // If I go from Train 1 to Train 2, do I pass any? No, just arrive. Cost $0? Or $50?
        // Usually "per station traveled" = 1 station = $50.
        // Let's assume adjacent = $50. 2 stations away = $100.
        
        const sortedTrains = [...TRAIN_TILES].sort((a, b) => a - b);
        const srcIdx = sortedTrains.indexOf(travelSourceIndex);
        const tgtIdx = sortedTrains.indexOf(tileIndex);
        
        // Calculate distance in "stations" (clockwise)
        let stationDist = (tgtIdx - srcIdx + 4) % 4;
        const cost = stationDist * 50;
        
        if (playerMoney[currentPlayer] < cost) {
          alert(`Not enough money to travel! Cost: $${cost}`);
          return;
        }
        
        if (confirm(`Travel to ${getTileName(tileIndex)}? Cost: $${cost}`)) {
          handleTravelConfirm(tileIndex, cost);
        }
      } else if (!isTrain) {
         // Ignore non-train clicks or show info?
         // Let's just allow normal property view if not a valid target?
         // Or strictly enforce travel selection.
         // Let's allow canceling travel by clicking current tile or "Cancel" button (need to add one).
      }
      return;
    }

    const property = RENT_DATA[tileIndex];
    if (property) {
      setSelectedProperty({ ...property, tileIndex });
      setShowPropertyModal(true);
    }
  };

  // Handle Upgrade Property
  const handleUpgradeProperty = () => {
    if (!selectedProperty) return;
    
    const { tileIndex, upgradeCost } = selectedProperty;
    const ownerIndex = propertyOwnership[tileIndex];
    
    // Safety checks
    if (ownerIndex === undefined) return; // Not owned
    if (playerMoney[ownerIndex] < upgradeCost) return; // Not enough money
    
    const currentLevel = propertyLevels[tileIndex] || 0;
    if (currentLevel >= 5) return; // Max level
    
    // Determine cost (Hotel = 2 * House Cost)
    let currentUpgradeCost = currentLevel === 4 ? upgradeCost * 2 : upgradeCost;
    
    // Check for 50% Discount
    if (activeEffects[currentPlayer]?.discount_50) {
      currentUpgradeCost = Math.floor(currentUpgradeCost / 2);
      setHistory(prev => [`🏷️ ${players[currentPlayer].name} used 50% Discount on Upgrade!`, ...prev.slice(0, 9)]);
      
      // Consume discount
      setActiveEffects(prev => ({
        ...prev,
        [currentPlayer]: { ...prev[currentPlayer], discount_50: false }
      }));
    }

    if (playerMoney[ownerIndex] < currentUpgradeCost) return; // Not enough money
    
    // Deduct money
    setPlayerMoney(prev => {
      const updated = [...prev];
      updated[ownerIndex] -= currentUpgradeCost;
      return updated;
    });
    
    // Trigger floating price animation
    const animKey = Date.now();
    setFloatingPrices(prev => [...prev, { price: currentUpgradeCost, tileIndex: selectedProperty.tileIndex, key: animKey, isPositive: false }]);
    setTimeout(() => {
      setFloatingPrices(prev => prev.filter(fp => fp.key !== animKey));
    }, 3000);

    // Increase level
    setPropertyLevels(prev => ({
      ...prev,
      [tileIndex]: currentLevel + 1
    }));
    
    setHistory(historyPrev => [
      `🔨 ${players[ownerIndex].name} upgraded ${selectedProperty.name} to Level ${currentLevel + 1} for $${currentUpgradeCost}`,
      ...historyPrev.slice(0, 9)
    ]);
  };



  // Debug: Test Rob Bank
  const debugRobBank = () => {
    setPlayerPositions(prev => {
      const newPos = [...prev];
      newPos[currentPlayer] = 18;
      return newPos;
    });
    setShowRobBankModal(true);
  };

  // Calculate tile positions - using viewport-relative units
  // Board fills 100vh, corners are 13.5vh each
  // Horizontal tiles: 8.111vh, Vertical tiles: 10.428vh (NO GAPS)
  const getTileStyle = (index, row, tileColor) => {
    const cornerSize = '13.5vh';
    const tileWidthHorizontal = 8.111;   // vh - exact for 9 tiles
    const tileHeightVertical = 10.428;   // vh - exact for 7 tiles
    
    const baseStyle = { background: tileColor };
    
    switch (row) {
      case 'bottom':
        return {
          ...baseStyle,
          bottom: 0,
          right: `calc(${cornerSize} + ${index * tileWidthHorizontal}vh)`,
        };
      case 'left':
        return {
          ...baseStyle,
          left: 0,
          bottom: `calc(${cornerSize} + ${index * tileHeightVertical}vh)`,
        };
      case 'top':
        return {
          ...baseStyle,
          top: 0,
          left: `calc(${cornerSize} + ${index * tileWidthHorizontal}vh)`,
        };
      case 'right':
        return {
          ...baseStyle,
          right: 0,
          top: `calc(${cornerSize} + ${index * tileHeightVertical}vh)`,
        };
      default:
        return baseStyle;
    }
  };

  // Get position for floating price animation (center of tile)
  const getFloatingPosition = (tileIndex) => {
    const hTileW = 8.111;
    const vTileH = 10.428;
    
    // Corners
    if (tileIndex === 0) return { top: 93, left: 93 };
    if (tileIndex === 10) return { top: 93, left: 7 };
    if (tileIndex === 18) return { top: 7, left: 7 };
    if (tileIndex === 28) return { top: 7, left: 93 };
    
    // Bottom row (1-9)
    if (tileIndex <= 9) {
      const offset = tileIndex - 1;
      return { top: 93, left: 86.5 - (offset * hTileW) - (hTileW / 2) };
    }
    // Left column (11-17)
    if (tileIndex <= 17) {
      const offset = tileIndex - 11;
      return { top: 86.5 - (offset * vTileH) - (vTileH / 2), left: 7 };
    }
    // Top row (19-27)
    if (tileIndex <= 27) {
      const offset = tileIndex - 19;
      return { top: 7, left: 13.5 + (offset * hTileW) + (hTileW / 2) };
    }
    // Right column (29-35)
    const offset = tileIndex - 29;
    return { top: 13.5 + (offset * vTileH) + (vTileH / 2), left: 93 };
  };

  // Calculate generic tile position for any index (0-35)
  // ALL UNITS IN VH relative to 100vh board
  const getPawnStyle = (tileIndex, playerIndex) => {
    // Board Layout Constants
    const hTileW = 8.111;
    const vTileH = 10.428;
    const pawnSize = 5;
    const overlapAmount = 2; // How much pawns overlap each other (vh)
    
    // Depth alignment (Cross-axis) - "Upper/Inner" side of tiles (away from price)
    // Horizontal tiles: Prices at outer edge, so pawns go near inner edge
    const topVal_BottomRow = 87;  // Near 86.5 (inner edge)
    const topVal_TopRow = 1;      // Near 0 (outer edge, but above price which is at bottom for top row)
    
    // Vertical tiles: Prices often at outer edge. Pawns toward inner (board center).
    // Left Column (0-13.5 X): Inner side = RIGHT side = higher X values -> 9vh
    // Right Column (86.5-100 X): Inner side = LEFT side = lower X values -> 87vh
    const leftVal_LeftCol = 9;    // Inner (right) side of left column tiles
    const leftVal_RightCol = 87;  // Inner (left) side of right column tiles
    
    // --- Dynamic Group Centering ---
    // Find all players on the same tile
    const playersOnThisTile = playerPositions.reduce((acc, pos, idx) => {
      if (pos === tileIndex) acc.push(idx);
      return acc;
    }, []);
    
    const numOnTile = playersOnThisTile.length;
    const myIndexInGroup = playersOnThisTile.indexOf(playerIndex);
    
    // Combined group width: First pawn is full width, subsequent pawns add (pawnSize - overlap)
    const effectiveAdd = pawnSize - overlapAmount; // 3vh per additional pawn
    const groupWidth = pawnSize + (numOnTile - 1) * effectiveAdd;
    
    // Offset of this pawn from the group's left edge
    const myOffsetInGroup = myIndexInGroup * effectiveAdd;
    
    // Offset to center the group on the tile center
    const groupCenterOffset = -groupWidth / 2;

    let pos = { top: 0, left: 0 };

    // 0: Start (Bottom Right) - 2x2 Grid
    if (tileIndex === 0) {
      pos.top = 90 + (Math.floor(myIndexInGroup / 2) * 3);
      pos.left = 90 + (myIndexInGroup % 2) * 3;
    }
    // 1-9: Bottom Row (Right to Left)
    else if (tileIndex <= 9) {
      const tileOffset = tileIndex - 1;
      const startRight = 86.5; 
      const trackCenter = startRight - (tileOffset * hTileW) - (hTileW / 2);
      
      pos.top = topVal_BottomRow;
      pos.left = trackCenter + groupCenterOffset + myOffsetInGroup;
    }
    // 10: Parking (Bottom Left) - 2x2 Grid
    else if (tileIndex === 10) {
      pos.top = 90 + (Math.floor(myIndexInGroup / 2) * 3);
      pos.left = 5 + (myIndexInGroup % 2) * 3;
    }
    // 11-17: Left Column (Bottom to Top)
    else if (tileIndex <= 17) {
      const tileOffset = tileIndex - 11;
      // Top edge of this tile (visually "upward" = lower Y value)
      const tileTopEdge = 86.5 - (tileOffset + 1) * vTileH;
      
      // Fixed top at upper edge of tile (like horizontal tiles)
      pos.top = tileTopEdge + 1;
      
      // Center group horizontally on depth axis (X: 0-13.5, center at ~7)
      const depthCenter = 7;
      pos.left = depthCenter + groupCenterOffset + myOffsetInGroup;
    }
    // 18: Rob Bank (Top Left) - 2x2 Grid
    else if (tileIndex === 18) {
      pos.top = 5 + (Math.floor(myIndexInGroup / 2) * 3);
      pos.left = 5 + (myIndexInGroup % 2) * 3;
    }
    // 19-27: Top Row (Left to Right)
    else if (tileIndex <= 27) {
      const tileOffset = tileIndex - 19;
      const startLeft = 13.5;
      const trackCenter = startLeft + (tileOffset * hTileW) + (hTileW / 2);
      
      pos.top = topVal_TopRow;
      pos.left = trackCenter + groupCenterOffset + myOffsetInGroup;
    }
    // 28: Jail (Top Right) - 2x2 Grid
    else if (tileIndex === 28) {
      pos.top = 5 + (Math.floor(myIndexInGroup / 2) * 3);
      pos.left = 90 + (myIndexInGroup % 2) * 3;
    }
    // 29-35: Right Column (Top to Bottom)
    else {
      const tileOffset = tileIndex - 29;
      // Top edge of this tile (first tile starts at 13.5)
      const tileTopEdge = 13.5 + tileOffset * vTileH;
      
      // Fixed top at upper edge of tile
      pos.top = tileTopEdge + 1;
      
      // Center group horizontally on depth axis (X: 86.5-100, center at ~93)
      const depthCenter = 93;
      pos.left = depthCenter + groupCenterOffset + myOffsetInGroup;
    }

    return {
      top: `${pos.top}vh`,
      left: `${pos.left}vh`,
      zIndex: 20 + playerIndex
    };
  };

  // Debug: Grant Monopoly
  const debugGrantMonopoly = () => {
    // Get current player's position
    const pos = playerPositions[currentPlayer];
    const property = RENT_DATA[pos];
    
    if (!property) {
      alert("Not on a valid property!");
      return;
    }
    
    const groupId = property.groupId;
    const groupTiles = Object.keys(RENT_DATA).filter(key => RENT_DATA[key].groupId === groupId);
    
    setPropertyOwnership(prev => {
      const updated = { ...prev };
      groupTiles.forEach(tIndex => {
        updated[tIndex] = currentPlayer;
      });
      return updated;
    });
    
    alert(`Granted Monopoly for Group ${groupId} to Player ${currentPlayer + 1}`);
  };

  // Render dice dots based on value
  const renderDiceDots = (value) => {
    const patterns = {
      1: [false, false, false, false, true, false, false, false, false],
      2: [true, false, false, false, false, false, false, false, true],
      3: [true, false, false, false, true, false, false, false, true],
      4: [true, false, true, false, false, false, true, false, true],
      5: [true, false, true, false, true, false, true, false, true],
      6: [true, false, true, true, false, true, true, false, true],
    };
    
    const pattern = patterns[value];
    if (!pattern) return null;

    return pattern.map((show, i) => (
      <div key={i} className={`dot ${show ? '' : 'hidden'}`}></div>
    ));
  };

  // Render Upgrades (Houses/Hotels)
  const renderUpgrades = (tileIndex, orientation) => {
    const level = propertyLevels[tileIndex] || 0;
    if (level === 0) return null;

    return (
      <div className={`upgrade-container ${orientation}`}>
        {level === 5 ? (
          <svg viewBox="0 0 384 512" className="hotel-icon" fill="currentColor">
            <path d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM112 192H272v32H112V192zm0 64H272v32H112V256zm0 64H272v32H112V320zm0 64H272v32H112V384z"/>
          </svg>
        ) : (
          Array.from({ length: level }).map((_, i) => (
            <svg key={i} viewBox="0 0 576 512" className="house-icon" fill="currentColor">
              <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 16-11 25.6-11s18.7 4 25.6 11L565.8 231.5c8 7 12 15 12 24z"/>
            </svg>
          ))
        )}
      </div>
    );
  };

  // Handle landscape rotation request
  const handleRotateToLandscape = async () => {
    try {
      // Request fullscreen first (required for orientation lock)
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }

      // Lock orientation to landscape
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
      }
    } catch (err) {
      // Orientation lock may fail on some browsers, just let user rotate manually
      console.log('Orientation lock not supported:', err);
      alert('Please rotate your device manually to landscape mode 📱↔️');
    }
  };

  return (
    <>
      {/* Portrait Mode Overlay */}
      <div className="portrait-overlay">
        <div className="rotate-icon">📱</div>
        <div className="rotate-text">Rotate for the best experience!</div>
        <button className="rotate-btn" onClick={handleRotateToLandscape}>
          TAP TO GO LANDSCAPE
        </button>
        <div className="rotate-subtext">Or rotate your device manually</div>
      </div>

      <div className="game-container">
        {/* Game Board */}
      <div className="board">
        {/* Corner Spaces */}
        <div className="corner start">
          <img src={startIcon} alt="Start" className="corner-icon" />
        </div>
        
        <div className="corner parking">
          <img src={parkingIcon} alt="Free Parking" className="corner-icon" />
        </div>
        
        <div className="corner robbank">
          <span className="rob-text">ROB</span>
          <img src={robBankIcon} alt="Rob Bank" className="corner-icon-center" />
          <span className="bank-text">BANK</span>
        </div>
        
        <div className="corner jail">
          <span className="jail-text">JAIL</span>
          <img src={jailIcon} alt="Jail" className="corner-icon-center" />
        </div>

        {/* Bottom Row */}
        {bottomRow.map((tile, index) => {
          const tileIndex = index + 1;
          const ownerStyle = getOwnerStyle(tileIndex);
          return (
            <div 
              key={tile.id}
              className={`tile horizontal ${tile.type}`}
              style={getTileStyle(index, 'bottom', tile.color)}
              onClick={() => handleTileClick(tileIndex)}
            >
              {renderUpgrades(tileIndex, 'bottom')}
              <span className="tile-name">{tile.name}</span>
              {tile.icon && <span className="tile-icon">{tile.icon}</span>}
              {tile.price && (
                <span 
                  className={`tile-price ${ownerStyle ? 'owned' : ''}`}
                  style={ownerStyle ? { backgroundColor: ownerStyle.bgColor, color: ownerStyle.textColor } : {}}
                >
                  {ownerStyle ? calculateRent(tileIndex) : tile.price}
                </span>
              )}
            </div>
          );
        })}

        {/* Left Column */}
        {leftColumn.map((tile, index) => {
          const tileIndex = index + 11;
          const ownerStyle = getOwnerStyle(tileIndex);
          return (
            <div 
              key={tile.id}
              className={`tile vertical left ${tile.type}`}
              style={getTileStyle(index, 'left', tile.color)}
              onClick={() => handleTileClick(tileIndex)}
            >
              {renderUpgrades(tileIndex, 'left')}
              <span className="tile-name">{tile.name}</span>
              {tile.icon && <span className="tile-icon">{tile.icon}</span>}
              {tile.price && (
                <span 
                  className={`tile-price ${ownerStyle ? 'owned' : ''}`}
                  style={ownerStyle ? { backgroundColor: ownerStyle.bgColor, color: ownerStyle.textColor } : {}}
                >
                  {ownerStyle ? calculateRent(tileIndex) : tile.price}
                </span>
              )}
            </div>
          );
        })}

        {/* Top Row */}
        {topRow.map((tile, index) => {
          const tileIndex = index + 19;
          const ownerStyle = getOwnerStyle(tileIndex);
          return (
            <div 
              key={tile.id}
              className={`tile horizontal ${tile.type}`}
              style={getTileStyle(index, 'top', tile.color)}
              onClick={() => handleTileClick(tileIndex)}
            >
              {renderUpgrades(tileIndex, 'top')}
              <span className="tile-name">{tile.name}</span>
              {tile.icon && <span className="tile-icon">{tile.icon}</span>}
              {tile.price && (
                <span 
                  className={`tile-price ${ownerStyle ? 'owned' : ''}`}
                  style={ownerStyle ? { backgroundColor: ownerStyle.bgColor, color: ownerStyle.textColor } : {}}
                >
                  {ownerStyle ? calculateRent(tileIndex) : tile.price}
                </span>
              )}
            </div>
          );
        })}

        {/* Right Column */}
        {rightColumn.map((tile, index) => {
          const tileIndex = index + 29;
          const ownerStyle = getOwnerStyle(tileIndex);
          return (
            <div 
              key={tile.id}
              className={`tile vertical right ${tile.type}`}
              style={getTileStyle(index, 'right', tile.color)}
              onClick={() => handleTileClick(tileIndex)}
            >
              {renderUpgrades(tileIndex, 'right')}
              <span className="tile-name">{tile.name}</span>
              {tile.icon && <span className="tile-icon">{tile.icon}</span>}
              {tile.price && (
                <span 
                  className={`tile-price ${ownerStyle ? 'owned' : ''}`}
                  style={ownerStyle ? { backgroundColor: ownerStyle.bgColor, color: ownerStyle.textColor } : {}}
                >
                  {ownerStyle ? calculateRent(tileIndex) : tile.price}
                </span>
              )}
            </div>
          );
        })}

        {/* Center Area */}
        <div className="board-center">
          {/* Decorative Elements */}
          <div className="center-decorations">
            <div className="yacht">🛥️</div>
          </div>

          {/* Dice Area */}
          <div className="dice-area">
            <div className="dice-container">
              <div className={`dice ${isRolling ? 'rolling-left' : ''}`}>
                {renderDiceDots(diceValues[0])}
              </div>
              <div className={`dice ${isRolling ? 'rolling-right' : ''}`}>
                {renderDiceDots(diceValues[1])}
              </div>
            </div>
            <div className="button-group">

              {buyingProperty && !showBuyModal && !buyingProperty.isTravelOffer && (
                <button 
                  className="buy-button" 
                  onClick={() => setShowBuyModal(true)}
                >
                  BUY
                </button>
              )}

              {buyingProperty && buyingProperty.isTravelOffer && (
                <button 
                  className="buy-button" 
                  onClick={handleTravelStart}
                  style={{ background: 'linear-gradient(to bottom, #2196F3, #1976D2)' }}
                >
                  TRAVEL
                </button>
              )}
              <button 
                className={`roll-button ${turnFinished ? 'done' : ''}`} 
                onClick={turnFinished ? handleEndTurn : () => rollDice()} 
                tabIndex="-1" 
                disabled={!turnFinished && (isRolling || isProcessingTurn || skippedTurns[currentPlayer])}
              >
                {turnFinished ? 'DONE' : 'ROLL'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="action-btn build">
              <span className="btn-icon">🏠</span>
              BUILD
            </button>
            <button className="action-btn sell">
              <span className="btn-icon">🔨</span>
              SELL
            </button>
            <button className="action-btn bank">
              <span className="btn-icon">🏛️</span>
              BANK
            </button>
            {/* Debug Test Buttons */}
            <button 
              className="action-btn" 
              style={{ background: '#1a5c1a' }}
              onClick={() => handleTileArrival(currentPlayer, 3, false)}
            >
              <span className="btn-icon">💵</span>
              CASH
            </button>
            <button 
              className="action-btn" 
              style={{ background: '#8B0000' }}
              onClick={() => handleTileArrival(currentPlayer, 26, false)}
            >
              <span className="btn-icon">⚔️</span>
              WAR
            </button>
          </div>
        </div>

        {/* Player Pawns */}
        <div className="pawns-container">
          {players.map((player, index) => (
            <div 
              key={player.id} 
              className={`player-pawn ${hoppingPlayer === index ? 'pawn-hopping' : ''}`}
              style={getPawnStyle(playerPositions[index], index)}
            >
              <img src={player.avatar} alt={player.name} className="pawn-img" />
            </div>
          ))}
        </div>

        {/* Floating Price Animations */}
        {floatingPrices.map((fp, index) => (
          <div 
            key={`${fp.key}-${index}`}
            className={`floating-price ${fp.isPositive ? 'positive' : 'negative'}`}
            style={{
              top: `${getFloatingPosition(fp.tileIndex).top}vh`,
              left: `${getFloatingPosition(fp.tileIndex).left}vh`
            }}
          >
            {fp.isPositive ? '+' : '-'}{(fp.price || 0).toLocaleString()}
          </div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        {/* Unified Top Section (Orange) */}
        <div className="sidebar-top-section">
          {/* Top Controls (Blue Icons) */}
          <div className="top-controls">
            <button className="control-btn settings">⚙️</button>
            <button className="control-btn sound">🔊</button>
            <button className="control-btn help">❓</button>
            <button className="control-btn menu">☰</button>
          </div>

          {/* Player Panel (Blue) */}
          <div className="player-panel">
            {players.map((player, index) => (
              <div 
                key={player.id}
                className={`player-item ${index === currentPlayer ? 'active' : ''}`}
              >
                <div className="player-avatar">
                  <img src={player.avatar} alt={player.name} className="avatar-img" />
                </div>
                <div className="player-info">
                  <div className="player-name">{player.name}</div>
                </div>
                <div className="player-money">${playerMoney[index].toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Stack (The Pot) */}
        <div className="cash-stack-panel" style={{
          background: 'linear-gradient(135deg, #1a5c1a 0%, #0d3d0d 100%)',
          borderRadius: '10px',
          padding: '8px',
          marginBottom: '4px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          position: 'relative' // For floating price positioning
        }}>
          <div style={{ fontSize: '14px', color: '#90EE90', marginBottom: '2px' }}>💵 CASH STACK</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00FF00' }}>${cashStack.toLocaleString()}</div>
          
          {/* Floating Prices for Cash Stack */}
          {cashStackFloatingPrices.map(fp => (
            <div 
              key={fp.key} 
              className="floating-price-stack"
              style={{ color: fp.amount >= 0 ? '#00FF00' : '#FF5252' }}
            >
              {fp.amount >= 0 ? '+' : ''}{fp.amount.toLocaleString()}
            </div>
          ))}
        </div>

        {/* History Panel */}
        <div className="history-panel">
          <div className="history-header">
            <h2>HISTORY</h2>
          </div>
          <div className="history-content">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buying Modal */}
      {(showBuyModal || (isModalClosing && buyingProperty)) && buyingProperty && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`}>
          <div className="buy-modal">
            {/* Header */}
            <div className="modal-heading">
              <span className="modal-heading-text">Buying</span>
            </div>
            
            {/* Body */}
            <div className="modal-body">
              <div className="modal-city-name">{buyingProperty.name}</div>
              <div className="modal-divider"></div>
              <div className="modal-details">
                <div className="modal-row">
                  <span>cost</span>
                  <span className="modal-value">
                    {activeEffects[buyingProperty.buyerIndex]?.discount_50 ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px', fontSize: '0.8em' }}>
                          ${buyingProperty.price?.toLocaleString()}
                        </span>
                        <span style={{ color: '#4CAF50' }}>
                          ${Math.floor(buyingProperty.price / 2)?.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      `$${buyingProperty.price?.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="modal-row">
                  <span>rent</span>
                  <span className="modal-value">${buyingProperty.rent?.toLocaleString()}</span>
                </div>
              </div>
              <div className="modal-buttons">
                <button className="modal-btn cancel" onClick={handleCancelBuy}>Cancel</button>
                <button className="modal-btn buy" onClick={handleBuyProperty}>Buy</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parking Modal */}
      {(showParkingModal || (isModalClosing && !buyingProperty && !showBuyModal && !showRobBankModal)) && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`}>
          <div className="buy-modal">
            {/* No Pink Header */}
            
            {/* Body */}
            <div className="modal-body" style={{ borderRadius: '14px', paddingTop: '32px' }}>
              <div className="modal-city-name" style={{ fontSize: '32px', marginBottom: '16px' }}>PARKING</div>
              <div className="modal-details" style={{ textAlign: 'center', margin: '20px auto', fontSize: '18px', fontWeight: 'bold', color: '#5a3000' }}>
                You will skip the next turn
              </div>
              
              {/* Button */}
              <div className="modal-buttons" style={{ justifyContent: 'center' }}>
                <button className="modal-btn buy" onClick={handleParkingConfirm} style={{ width: '120px' }}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rob Bank Modal */}
      {(showRobBankModal || (isModalClosing && !buyingProperty && !showBuyModal && !showParkingModal && !showPropertyModal)) && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`}>
          <div className="buy-modal">
            {/* Header */}
            <div className="modal-heading" style={{ 
              background: robStatus === 'caught' 
                ? 'linear-gradient(to bottom, #C62828 0%, #B71C1C 100%)' 
                : robStatus === 'success'
                  ? 'linear-gradient(to bottom, #2E7D32 0%, #1B5E20 100%)'
                  : 'linear-gradient(to bottom, #1A237E 0%, #0D47A1 100%)' 
            }}>
              <span className="modal-heading-text">
                {robStatus === 'processing' ? 'ROBBING...' : 
                 robStatus === 'success' ? 'SUCCESS!' : 
                 robStatus === 'caught' ? 'BUSTED!' : 'ROB BANK'}
              </span>
            </div>
            
            {/* Body */}
            <div className="modal-body">
              {robStatus === 'idle' && (
                <>
                  <div className="modal-city-name">RISK IT ALL?</div>
                  <div className="modal-divider"></div>
                  <div className="modal-details" style={{ textAlign: 'center' }}>
                    <div className="modal-row" style={{ justifyContent: 'center', color: '#2E7D32' }}>
                      <span>WIN $1k - $10k</span>
                    </div>
                    <div className="modal-row" style={{ justifyContent: 'center', fontSize: '14px', margin: '5px 0' }}>
                      <span>OR</span>
                    </div>
                    <div className="modal-row" style={{ justifyContent: 'center', color: '#C62828' }}>
                      <span>GO TO JAIL</span>
                    </div>
                  </div>
                  <div className="modal-buttons">
                    <button className="modal-btn cancel" onClick={handleCancelBuy}>LEAVE</button>
                    <button className="modal-btn buy" onClick={handleRobBankAttempt}>ROB!</button>
                  </div>
                </>
              )}

              {robStatus === 'processing' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div className="modal-city-name" style={{ fontSize: '24px', marginBottom: '20px' }}>CRACKING SAFE...</div>
                  
                  <div className="cracking-progress">
                    <div className="cracking-bar" style={{ width: `${robProgress}%` }}></div>
                  </div>
                </div>
              )}

              {robStatus === 'success' && (
                <>
                  <div className="modal-city-name" style={{ color: '#2E7D32' }}>YOU STOLE</div>
                  <div className="modal-city-name" style={{ fontSize: '40px', color: '#2E7D32', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    ${robResult.amount.toLocaleString()}
                  </div>
                  <div className="modal-buttons" style={{ marginTop: '20px' }}>
                    <button className="modal-btn buy" onClick={handleRobBankComplete} style={{ width: '100%' }}>COLLECT</button>
                  </div>
                </>
              )}

              {robStatus === 'caught' && (
                <>
                  <div className="modal-city-name" style={{ color: '#C62828' }}>POLICE CAUGHT YOU!</div>
                  <div style={{ fontSize: '50px', textAlign: 'center', margin: '10px 0' }}>👮‍♂️</div>
                  <div className="modal-buttons" style={{ marginTop: '20px' }}>
                    <button className="modal-btn cancel" onClick={handleRobBankComplete} style={{ width: '100%' }}>GO TO JAIL</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rob Bank Modal */}
      {(showRobBankModal || (isModalClosing && robStatus !== 'idle')) && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`}>
          <div className="buy-modal">
            {/* Header */}
            <div className="modal-heading" style={{ background: 'linear-gradient(to bottom, #1A237E 0%, #0D47A1 100%)' }}>
              <span className="modal-heading-text">ROB BANK</span>
            </div>
            
            {/* Body */}
            <div className="modal-body">
              {robStatus === 'idle' && (
                <>
                  <div className="modal-city-name" style={{ fontSize: '20px', marginBottom: '20px' }}>
                    RISK IT ALL?
                  </div>
                  <div className="modal-details" style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div className="modal-row" style={{ justifyContent: 'center', color: '#2E7D32' }}>
                      <span>WIN $1,000 - $10,000</span>
                    </div>
                    <div className="modal-row" style={{ justifyContent: 'center', fontSize: '14px', margin: '5px 0' }}>
                      <span>OR</span>
                    </div>
                    <div className="modal-row" style={{ justifyContent: 'center', color: '#C62828' }}>
                      <span>GO TO JAIL</span>
                    </div>
                  </div>
                  <div className="modal-buttons">
                    <button className="modal-btn cancel" onClick={() => closeAllModals(() => endTurn(currentPlayer, false))}>LEAVE</button>
                    <button className="modal-btn buy" onClick={handleRobBankAttempt} style={{ background: '#4CAF50' }}>ROB!</button>
                  </div>
                </>
              )}

              {robStatus === 'processing' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div className="modal-city-name" style={{ fontSize: '24px', marginBottom: '20px' }}>CRACKING SAFE...</div>
                  
                  <div className="cracking-progress" style={{ 
                    width: '100%', 
                    height: '20px', 
                    backgroundColor: '#eee', 
                    borderRadius: '10px', 
                    overflow: 'hidden',
                    border: '1px solid #ccc'
                  }}>
                    <div className="cracking-bar" style={{ 
                      width: `${robProgress}%`, 
                      height: '100%', 
                      backgroundColor: '#D32F2F',
                      transition: 'width 0.05s linear'
                    }}></div>
                  </div>
                </div>
              )}

              {robStatus === 'success' && (
                <>
                  <div className="modal-city-name" style={{ color: '#2E7D32' }}>YOU STOLE</div>
                  <div className="modal-city-name" style={{ fontSize: '40px', color: '#2E7D32', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    ${robResult.amount.toLocaleString()}
                  </div>
                  <div className="modal-buttons" style={{ marginTop: '20px' }}>
                    <button className="modal-btn buy" onClick={handleRobBankComplete} style={{ width: '100%', background: '#2E7D32' }}>COLLECT</button>
                  </div>
                </>
              )}

              {robStatus === 'caught' && (
                <>
                  <div className="modal-city-name" style={{ color: '#C62828' }}>POLICE CAUGHT YOU!</div>
                  <div style={{ fontSize: '50px', textAlign: 'center', margin: '10px 0' }}>👮‍♂️</div>
                  <div className="modal-buttons" style={{ marginTop: '20px' }}>
                    <button className="modal-btn cancel" onClick={handleRobBankComplete} style={{ width: '100%' }}>GO TO JAIL</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Property War Modal */}
      {showWarModal && (
        <div className="modal-overlay">
          <div className="buy-modal war-modal">
            {/* Header */}
            <div className="modal-heading" style={{ background: 'linear-gradient(to bottom, #E91E63 0%, #C2185B 100%)' }}>
              <span className="modal-heading-text">⚔️ PROPERTY WAR ⚔️</span>
            </div>
            
            {/* Body */}
            <div className="modal-body">
              {/* Join Phase */}
              {warPhase === 'join' && (
                <>
                  <div className="modal-city-name" style={{ fontSize: '18px', marginBottom: '10px' }}>
                    {warMode === 'A' ? '🏠 STANDARD WAR' : '💰 CASH BATTLE'}
                  </div>
                  <div style={{ fontSize: '14px', marginBottom: '15px', color: '#5D4037', fontWeight: 'bold' }}>
                    {warMode === 'A' 
                      ? 'Pay $3,000 to compete for a random property!' 
                      : 'All properties sold! Pay $2,000 to compete for the Battle Pot!'}
                  </div>
                  
                  {/* Player Join Buttons */}
                  <div className="war-join-list" style={{ marginBottom: '15px' }}>
                    {players.map((player, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '8px',
                        marginBottom: '6px',
                        background: warParticipants.includes(idx) ? '#e8f5e9' : '#f5f5f5',
                        borderRadius: '6px',
                        border: warParticipants.includes(idx) ? '2px solid #4CAF50' : '1px solid #ddd'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={player.avatar} alt={player.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                          <span style={{ fontWeight: 'bold' }}>{player.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!warParticipants.includes(idx) ? (
                            <button 
                              className="modal-btn buy" 
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleWarJoin(idx)}
                              disabled={playerMoney[idx] < (warMode === 'A' ? 3000 : 2000)}
                            >
                              JOIN (${warMode === 'A' ? '3,000' : '2,000'})
                            </button>
                          ) : (
                            <button 
                              className="modal-btn cancel" 
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                              onClick={() => handleWarWithdraw(idx)}
                            >
                              WITHDRAW
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="modal-buttons">
                    <button 
                      className="modal-btn buy" 
                      onClick={handleWarStartProgress}
                      disabled={warParticipants.length === 0}
                      style={{ width: '100%', background: warParticipants.length ? '#8B0000' : '#ccc' }}
                    >
                      START WAR ({warParticipants.length} participants)
                    </button>
                  </div>
                </>
              )}
              
              {/* Progress Phase (Mode A only) */}
              {warPhase === 'progress' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div className="modal-city-name" style={{ fontSize: '20px', marginBottom: '20px' }}>SELECTING PROPERTY...</div>
                  <div style={{ 
                    width: '100%', 
                    height: '20px', 
                    backgroundColor: '#eee', 
                    borderRadius: '10px', 
                    overflow: 'hidden'
                  }}>
                    <div 
                      className="war-progress-bar"
                      style={{ 
                        width: '0%',
                        height: '100%', 
                        backgroundColor: '#E91E63',
                        borderRadius: '10px',
                        animation: 'warProgressFill 3s ease-out forwards'
                      }}
                    ></div>
                  </div>
                  <style>{`
                    @keyframes warProgressFill {
                      from { width: 0%; }
                      to { width: 100%; }
                    }
                  `}</style>
                </div>
              )}
              
              {/* Reveal Phase */}
              {warPhase === 'reveal' && warProperty && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '16px', color: '#5D4037', fontWeight: 'bold', marginBottom: '10px' }}>The war is for...</div>
                  <div className="modal-city-name" style={{ fontSize: '28px', color: '#8B0000' }}>
                    {warProperty.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#5D4037', fontWeight: 'bold', marginTop: '10px' }}>
                    (Worth ${warProperty.price?.toLocaleString()})
                  </div>
                </div>
              )}
              
              {/* Roll Phase - Ready to start */}
              {warPhase === 'roll' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div className="modal-city-name" style={{ fontSize: '20px', marginBottom: '20px' }}>
                    {warMode === 'A' && warProperty ? `Fighting for "${warProperty.name}"` : `Fighting for $${battlePot.toLocaleString()}`}
                  </div>
                  <div className="modal-buttons">
                    <button 
                      className="modal-btn buy" 
                      onClick={handleWarStartRolling}
                      style={{ width: '100%', background: '#8B0000' }}
                    >
                      🎲 START ROLLING!
                    </button>
                  </div>
                </div>
              )}
              
              {/* Rolling Phase - Turn by turn */}
              {warPhase === 'rolling' && warCurrentRoller !== null && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div className="modal-city-name" style={{ fontSize: '18px', marginBottom: '15px' }}>
                    {players[warParticipants[warCurrentRoller]]?.name}'s Turn
                  </div>
                  
                  {/* Dice Display */}
                  <div className="dice-container" style={{ marginBottom: '15px', justifyContent: 'center' }}>
                    <div className={`dice ${warIsRolling ? 'rolling-left' : ''}`}>
                      {renderDiceDots(warDiceValues[0])}
                    </div>
                    <div className={`dice ${warIsRolling ? 'rolling-right' : ''}`}>
                      {renderDiceDots(warDiceValues[1])}
                    </div>
                  </div>
                  
                  {/* Previous Rolls */}
                  {Object.keys(warRolls).length > 0 && (
                    <div className="war-rolling-list" style={{ marginBottom: '15px' }}>
                      {Object.entries(warRolls).map(([idx, roll]) => (
                        <div key={idx} style={{ 
                          padding: '8px 12px', 
                          marginBottom: '4px',
                          background: '#f0f0f0',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontWeight: 'bold',
                          fontSize: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={players[parseInt(idx)].avatar} alt={players[parseInt(idx)].name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                            <span>{players[parseInt(idx)].name}</span>
                          </div>
                          <span>🎲 {roll}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="modal-buttons">
                    <button 
                      className="modal-btn buy" 
                      onClick={handleWarDoRoll}
                      disabled={warIsRolling}
                      style={{ width: '100%', background: warIsRolling ? '#ccc' : '#8B0000' }}
                    >
                      {warIsRolling ? 'ROLLING...' : '🎲 ROLL!'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Result Phase */}
              {warPhase === 'result' && (
                <div className="war-result-container">
                  {/* Winner Announcement */}
                  {Object.keys(warRolls).length > 0 && (() => {
                    const winnerIdx = parseInt(Object.entries(warRolls).reduce((a, b) => b[1] > a[1] ? b : a)[0]);
                    return (
                      <div className="war-winner-section">
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏆</div>
                        <div className="modal-city-name" style={{ fontSize: '24px', color: '#E91E63', marginBottom: '5px' }}>
                          {players[winnerIdx].name} WINS!
                        </div>
                        <div style={{ fontSize: '16px', color: '#5D4037', fontWeight: 'bold', marginBottom: '20px' }}>
                          {warMode === 'A' && warProperty 
                            ? `Won "${warProperty.name}"` 
                            : `Won $${battlePot.toLocaleString()}`}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Show all rolls */}
                  <div className="war-roll-list">
                    {Object.entries(warRolls).map(([playerIdx, roll]) => {
                      const isWinner = roll === Math.max(...Object.values(warRolls));
                      return (
                        <div key={playerIdx} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          marginBottom: '6px',
                          background: isWinner 
                            ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)' 
                            : 'linear-gradient(135deg, #FFB74D 0%, #FF9800 100%)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={players[parseInt(playerIdx)].avatar} alt={players[parseInt(playerIdx)].name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                            <span style={{ fontSize: '16px' }}>
                              {players[parseInt(playerIdx)].name}{isWinner && ' 👑'}
                            </span>
                          </div>
                          <span style={{ fontSize: '16px' }}>
                            🎲 {roll}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="modal-buttons">
                    <button 
                      className="modal-btn buy" 
                      onClick={handleWarComplete}
                      style={{ width: '100%', background: '#4CAF50' }}
                    >
                      CONFIRM
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chance Modal */}
      {(showChanceModal || (isModalClosing && !buyingProperty && !showBuyModal && !showParkingModal && !showRobBankModal && !showPropertyModal && !showChestModal)) && currentChanceCard && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`}>
          <div className="buy-modal">
            {/* Header */}
            <div className="modal-heading" style={{ background: 'linear-gradient(to bottom, #FF9800 0%, #F57C00 100%)' }}>
              <span className="modal-heading-text">CHANCE</span>
            </div>
            
            {/* Body */}
            <div className="modal-body">
              <div className="modal-city-name" style={{ fontSize: '20px', marginBottom: '20px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentChanceCard.text}
              </div>
              
              <div className="modal-buttons" style={{ justifyContent: 'center' }}>
                <button 
                  className="modal-btn buy" 
                  onClick={() => handleChanceCardAction(currentChanceCard)}
                  style={{ width: '120px', background: '#FF9800' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chest Modal */}
      {(showChestModal || (isModalClosing && !buyingProperty && !showBuyModal && !showParkingModal && !showRobBankModal && !showPropertyModal && !showChanceModal)) && currentChestCard && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`}>
          <div className="buy-modal">
            {/* Header */}
            <div className="modal-heading" style={{ background: 'linear-gradient(to bottom, #795548 0%, #5D4037 100%)' }}>
              <span className="modal-heading-text">TREASURE CHEST</span>
            </div>
            
            {/* Body */}
            <div className="modal-body">
              <div className="modal-city-name" style={{ fontSize: '20px', marginBottom: '20px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentChestCard.text}
              </div>
              
              <div className="modal-buttons" style={{ justifyContent: 'center' }}>
                <button 
                  className="modal-btn buy" 
                  onClick={() => handleChestCardAction(currentChestCard)}
                  style={{ width: '120px', background: '#795548' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {(showPropertyModal || (isModalClosing && selectedProperty && !showBuyModal && !showParkingModal && !showRobBankModal)) && selectedProperty && (
        <div className={`modal-overlay ${isModalClosing ? 'closing' : ''}`}>
          <div className="buy-modal">
            {/* Header */}
            <div className="modal-heading">
              <span className="modal-heading-text">PROPERTY</span>
            </div>
            
            {/* Body */}
            <div className="modal-body">
              <div className="modal-city-name">{selectedProperty.name}</div>
              <div className="modal-divider"></div>
              
              <div className="modal-details">
                {/* Rent Schedule */}
                <div style={{ marginBottom: '15px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '4px' }}>
                    <span>Level</span>
                    <span>Rent</span>
                  </div>
                  {selectedProperty.rentLevels.map((rent, index) => {
                     const currentLevel = propertyLevels[selectedProperty.tileIndex] || 0;
                     const isCurrent = currentLevel === index;
                     const label = index === 0 ? 'Base' : index === 5 ? 'Hotel' : `${index} House${index > 1 ? 's' : ''}`;
                     return (
                       <div key={index} style={{ 
                         display: 'flex', 
                         justifyContent: 'space-between', 
                         padding: '4px 8px',
                         backgroundColor: isCurrent ? 'rgba(33, 150, 243, 0.15)' : 'transparent',
                         borderRadius: '4px',
                         fontWeight: isCurrent ? 'bold' : 'normal',
                         color: isCurrent ? '#1565C0' : 'inherit'
                       }}>
                         <span>{label}</span>
                         <span>${rent.toLocaleString()}</span>
                       </div>
                     );
                  })}
                </div>
                
                <div className="modal-divider"></div>
                
                <div className="modal-row" style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Cost per House</span>
                  <span className="modal-value" style={{ fontSize: '14px', fontWeight: 'bold' }}>${selectedProperty.upgradeCost?.toLocaleString()}</span>
                </div>
                <div className="modal-row">
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Cost for Hotel</span>
                  <span className="modal-value" style={{ fontSize: '14px', fontWeight: 'bold' }}>${(selectedProperty.upgradeCost * 2)?.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="modal-buttons">
                <button className="modal-btn cancel" onClick={() => closeAllModals()}>CLOSE</button>
                
                {/* Upgrade Button - Only if owned by current player (or any player? let's assume current player for now, or just owner) */}
                {/* Actually, in local multiplayer, anyone can click. But logically only the owner should upgrade. */}
                {propertyOwnership[selectedProperty.tileIndex] !== undefined && 
                 hasMonopoly(selectedProperty.tileIndex, propertyOwnership[selectedProperty.tileIndex]) && 
                 (
                   <button 
                     className="modal-btn buy" 
                     onClick={handleUpgradeProperty}
                     disabled={
                       propertyLevels[selectedProperty.tileIndex] >= 5 || 
                       playerMoney[currentPlayer] < (propertyLevels[selectedProperty.tileIndex] === 4 ? selectedProperty.upgradeCost * 2 : selectedProperty.upgradeCost)
                     }
                     style={{ 
                       background: '#4CAF50', 
                       opacity: (propertyLevels[selectedProperty.tileIndex] >= 5 || playerMoney[currentPlayer] < (propertyLevels[selectedProperty.tileIndex] === 4 ? selectedProperty.upgradeCost * 2 : selectedProperty.upgradeCost)) ? 0.5 : 1 
                     }}
                   >
                     {propertyLevels[selectedProperty.tileIndex] === 4 ? 'BUY HOTEL' : 'UPGRADE'}
                   </button>
                 )
                }
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Debug Panel */}
      <div className="debug-panel">
        <input 
          type="number" 
          min="2" 
          max="12" 
          value={debugDiceValue} 
          onChange={(e) => setDebugDiceValue(parseInt(e.target.value))}
          style={{ width: '50px', marginRight: '5px', padding: '5px' }}
        />
        <button onClick={() => rollDice(debugDiceValue)} disabled={isRolling || isProcessingTurn}>
          Force Roll
        </button>
      </div>
    </div>
    </>
  );
}

export default App;
