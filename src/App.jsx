import { useState, useEffect } from 'react';
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
import './App.css';

function App() {
  const [diceValues, setDiceValues] = useState([6, 6]);
  const [isRolling, setIsRolling] = useState(false);
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

  // Rob Bank modal state
  const [showRobBankModal, setShowRobBankModal] = useState(false);
  const [robBankStatus, setRobBankStatus] = useState('idle'); // 'idle', 'processing', 'success', 'caught'
  const [robBankReward, setRobBankReward] = useState(0);

  // Property Details/Upgrade Modal state
  const [showPropertyModal, setShowPropertyModal] = useState(false);
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

  // Helper: Close any modal with animation
  const closeAllModals = (callback) => {
    setIsModalClosing(true);
    setTimeout(() => {
      setShowBuyModal(false);
      setBuyingProperty(null);
      setShowBuyModal(false);
      setBuyingProperty(null);
      setShowParkingModal(false);
      setShowRobBankModal(false);
      setShowPropertyModal(false);
      setSelectedProperty(null);
      setShowPropertyModal(false);
      setSelectedProperty(null);
      setShowChanceModal(false);
      setShowChestModal(false);
      setRobBankStatus('idle'); // Reset status
      setIsModalClosing(false);
      if (callback) callback();
    }, 300); // 300ms matches CSS animation duration
  };

  // Floating price animation state - array to support multiple animations
  const [floatingPrices, setFloatingPrices] = useState([]); // [{ price, tileIndex, key, isPositive }]
  
  // Player money state (mutable copy of initial data)
  const [playerMoney, setPlayerMoney] = useState(players.map(p => p.money));

  // Helper to get property info by tile index
  const getPropertyByTileIndex = (tileIndex) => {
    // Corners are not properties
    if (tileIndex === 0 || tileIndex === 10 || tileIndex === 18 || tileIndex === 28) {
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

  // Async function to move pawn step-by-step
  const movePlayerToken = async (playerIdx, steps, delay = 300) => {
    const startPos = playerPositions[playerIdx];
    const direction = steps > 0 ? 1 : -1;
    const count = Math.abs(steps);
    
    setHoppingPlayer(playerIdx); // Enable hop animation

    console.log("Start Turn Sound");

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
             setFloatingPrices(fpPrev => [...fpPrev, { price: 1000, tileIndex: 0, key: Date.now(), isPositive: true }]);
             setHistory(histPrev => [`${players[playerIdx].name} passed GO! Collect $1000`, ...histPrev.slice(0, 9)]);
        }
        
        return newPositions;
      });

      // 2. Play step sound (placeholder)
      console.log("Hop Sound");

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
      // Space to Roll
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        if (!showBuyModal && !showParkingModal && !showRobBankModal && !isRolling && !skippedTurns[currentPlayer]) {
          rollDice();
        }
      }
      
      // Enter to Confirm
      if (e.code === 'Enter') {
        if (showBuyModal) {
          handleBuyProperty();
        } else if (showParkingModal) {
          handleParkingConfirm();
        } else if (showRobBankModal) {
          if (robBankStatus === 'idle') {
            handleRobBankAttempt();
          } else if (robBankStatus === 'success' || robBankStatus === 'caught') {
            handleRobBankComplete();
          }
        }
      }
      
      // Escape to Cancel
      if (e.code === 'Escape') {
        if (showBuyModal) {
          handleCancelBuy();
        } else if (showRobBankModal) {
          if (robBankStatus === 'idle') {
            handleCancelBuy();
          } else if (robBankStatus === 'success' || robBankStatus === 'caught') {
            handleRobBankComplete();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showBuyModal, showParkingModal, isRolling, skippedTurns, currentPlayer, buyingProperty]);

  // Helper to handle turn end (switch or stay for doubles)
  const endTurn = (movingPlayer, isDoubles) => {
    if (isDoubles) {
      setHistory(historyPrev => [
        `🎲 ${players[movingPlayer].name} rolled doubles! Extra turn!`,
        ...historyPrev.slice(0, 9)
      ]);
      // Don't switch player
    } else {
      setTimeout(() => {
        // Find next player who isn't skipped
        let nextIdx = (movingPlayer + 1) % players.length;
        let skippedPlayers = [];
        
        // Loop to find next valid player
        while (skippedTurns[nextIdx]) {
           skippedPlayers.push(nextIdx);
           nextIdx = (nextIdx + 1) % players.length;
           // Safety break
           if (nextIdx === movingPlayer) break; 
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
      }, 500);
    }
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
    
    return validCards[Math.floor(Math.random() * validCards.length)];
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

    // Rob Bank (Index 18)
    if (tileIndex === 18) {
      // Robbery Event: Lose $300
      setPlayerMoney(prev => {
        const updated = [...prev];
        updated[playerIndex] -= 300;
        return updated;
      });
      const animKey = Date.now();
      setFloatingPrices(prev => [...prev, { price: 300, tileIndex: 18, key: animKey, isPositive: false }]);
      setHistory(prev => [`💸 ${players[playerIndex].name} was robbed of $300!`, ...prev.slice(0, 9)]);
      
      // Optional: Show Rob Bank Modal only if we want the "Risk it all" mechanic. 
      // User said "robber tile shows modal like usual buying one, but it shoudl be a robbery, saying youre robbed $300"
      // So we replace the modal trigger with this direct effect.
      // However, the "Rob Bank" modal was for a specific mini-game. 
      // If the user wants the mini-game to be separate or removed, we should clarify.
      // But based on "robber tile shows modal like usual buying one", it implies tile 18 was treated as property.
      // My previous code had `if (tileIndex === 18) { setShowRobBankModal(true); return; }`
      // The user says "shows modal like usual buying one". This suggests my previous check might have failed or fallen through.
      // Wait, tile 18 is "Rob Bank". If I look at `handleTileArrival`, it checks tile 18 explicitly.
      // If the user sees a "buying" modal, maybe `getPropertyByTileIndex` returns something for 18?
      // `getPropertyByTileIndex` returns null for 18.
      // Ah, maybe the user means the "Rob Bank" modal LOOKS like a buying modal?
      // "robber tile shows modal like usual buying one" -> The Rob Bank modal I made reuses the "buy-modal" class.
      // But the user says "it shoudl be a robbery, saying youre robbed $300".
      // So I will change the behavior of landing on tile 18 to just be a robbery.
      // I will keep the "Rob Bank" modal for the "Risk it all" mechanic if it's triggered by something else, or remove it if tile 18 was the only trigger.
      // For now, I'll make landing on 18 just take money.
      
      endTurn(playerIndex, isDoubles);
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
    
    // Tax (Index 3)
    if (tileIndex === 3) {
      // Check for Tax Immunity
      if (playerInventory[playerIndex]?.tax_immunity > 0) {
        setHistory(prev => [`🛡️ ${players[playerIndex].name} used Tax Immunity!`, ...prev.slice(0, 9)]);
        setPlayerInventory(prev => ({
          ...prev,
          [playerIndex]: {
            ...prev[playerIndex],
            tax_immunity: prev[playerIndex].tax_immunity - 1
          }
        }));
        endTurn(playerIndex, isDoubles);
        return;
      }

      // Pay $200
      setPlayerMoney(prev => {
        const updated = [...prev];
        updated[playerIndex] -= 200;
        return updated;
      });
      const animKey = Date.now();
      setFloatingPrices(prev => [...prev, { price: 200, tileIndex, key: animKey, isPositive: false }]);
      setHistory(prev => [`${players[playerIndex].name} paid $200 Tax`, ...prev.slice(0, 9)]);
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
      
      // Trigger dual floating price animations
      const animKey = Date.now();
      setFloatingPrices(prev => [
        ...prev, 
        { price: rent, tileIndex: tileIndex, key: animKey, isPositive: false },
        { price: rent, tileIndex: ownerPosition, key: animKey + 1, isPositive: true }
      ]);
      setTimeout(() => {
        setFloatingPrices(prev => prev.filter(fp => fp.key !== animKey && fp.key !== animKey + 1));
      }, 3000);
      
      // Add to history
      setHistory(historyPrev => [
        `${players[playerIndex].name} paid $${rent} rent to ${players[ownerIndex].name}`,
        ...historyPrev.slice(0, 9)
      ]);
      
      // Handle turn end
      endTurn(playerIndex, isDoubles);
    } else {
      // No action needed (e.g. own property, or non-action tile)
      endTurn(playerIndex, isDoubles);
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
          setFloatingPrices(prev => [
            ...prev, 
            { price: card.amount, tileIndex: currentPos, key: Date.now(), isPositive: true }
          ]);
          setHistory(prev => [`${players[playerIndex].name} gained $${card.amount}: ${card.text}`, ...prev.slice(0, 9)]);
          break;
          
        case 'MONEY_SUBTRACT':
          setPlayerMoney(prev => {
            const updated = [...prev];
            updated[playerIndex] -= card.amount;
            return updated;
          });
          // Floating Price
          setFloatingPrices(prev => [
            ...prev, 
            { price: card.amount, tileIndex: currentPos, key: Date.now(), isPositive: false }
          ]);
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
             setFloatingPrices(prev => [
                ...prev, 
                { price: 200, tileIndex: 0, key: Date.now(), isPositive: true }
             ]);
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
          const fwdSteps = Math.floor(Math.random() * 10) + 1;
          await movePlayerToken(playerIndex, fwdSteps);
          const newPosFwd = (currentPos + fwdSteps + 36) % 36;
          setHistory(prev => [`${players[playerIndex].name} moved forward ${fwdSteps} steps`, ...prev.slice(0, 9)]);
          handleTileArrival(playerIndex, newPosFwd, false);
          return;

        case 'MOVE_BACKWARD_RANDOM':
          const backSteps = -(Math.floor(Math.random() * 10) + 1);
          await movePlayerToken(playerIndex, backSteps);
          const newPosBack = (currentPos + backSteps + 36) % 36;
          setHistory(prev => [`${players[playerIndex].name} moved back ${Math.abs(backSteps)} steps`, ...prev.slice(0, 9)]);
          handleTileArrival(playerIndex, newPosBack, false);
          return;

        case 'MOVE_TO_RANDOM':
          let randomTarget;
          do {
            randomTarget = Math.floor(Math.random() * 36);
          } while (randomTarget === currentPos);
          
          // Calculate steps to animate properly
          const stepsToRandom = (randomTarget - currentPos + 36) % 36;
          await movePlayerToken(playerIndex, stepsToRandom);
          
          setHistory(prev => [`${players[playerIndex].name} teleported to ${getTileName(randomTarget)}`, ...prev.slice(0, 9)]);
          handleTileArrival(playerIndex, randomTarget, false);
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
            setFloatingPrices(prev => [
              ...prev, 
              { price: totalCost, tileIndex: currentPos, key: Date.now(), isPositive: false }
            ]);
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
          setFloatingPrices(prev => [
            ...prev, 
            { price: totalDeduction, tileIndex: currentPos, key: Date.now(), isPositive: false }
          ]);
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
  const rollDice = async () => {
    if (isRolling || skippedTurns[currentPlayer]) return; // Prevent rolling if skipped (just in case)
    
    setIsRolling(true);

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
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
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
        // Don't switch player
      } else {
        setTimeout(() => {
          setCurrentPlayer(prev => (prev + 1) % players.length);
        }, 300);
      }
    });
  };

  // Handle canceling a purchase
  const handleCancelBuy = () => {
    const buyerIndex = buyingProperty?.buyerIndex;
    const isDoubles = buyingProperty?.isDoubles;
    
    closeAllModals(() => {
      if (isDoubles && buyerIndex !== undefined) {
        setHistory(historyPrev => [
          `🎲 ${players[buyerIndex].name} rolled doubles! Extra turn!`,
          ...historyPrev.slice(0, 9)
        ]);
        // Don't switch player
      } else {
        setTimeout(() => {
          setCurrentPlayer(prev => (prev + 1) % players.length);
        }, 300);
      }
    });
  };

  // Handle Parking Confirm
  const handleParkingConfirm = () => {
    // Mark player to skip next turn
    setSkippedTurns(prev => ({ ...prev, [currentPlayer]: true }));
    
    closeAllModals(() => {
      setTimeout(() => {
        setCurrentPlayer(prev => (prev + 1) % players.length);
      }, 300);
    });
  };

  // Handle Rob Bank Attempt
  const handleRobBankAttempt = async () => {
    // 1. Set status to processing (suspense)
    setRobBankStatus('processing');
    
    // 2. Wait for animation (4 seconds)
    await wait(4000);
    
    // 3. Determine Result
    const success = Math.random() < 0.5;
    
    if (success) {
      // Calculate variable reward: $1,000 - $10,000
      const reward = Math.floor(Math.random() * 9001) + 1000;
      // Round to nearest 100 for cleaner numbers
      const roundedReward = Math.round(reward / 100) * 100;
      
      setRobBankReward(roundedReward);
      setRobBankStatus('success');
    } else {
      setRobBankStatus('caught');
    }
  };

  // Handle Rob Bank Complete (Close Modal & Apply Effects)
  const handleRobBankComplete = () => {
    closeAllModals(() => {
      if (robBankStatus === 'success') {
        // Add Money
        setPlayerMoney(prev => {
          const updated = [...prev];
          updated[currentPlayer] += robBankReward;
          return updated;
        });
        
        // Floating price animation (positive)
        const animKey = Date.now();
        setFloatingPrices(prev => [...prev, { price: robBankReward, tileIndex: 18, key: animKey, isPositive: true }]);
        setTimeout(() => {
          setFloatingPrices(prev => prev.filter(fp => fp.key !== animKey));
        }, 3000);
        
        setHistory(historyPrev => [
          `💰 ${players[currentPlayer].name} ROBBED THE BANK! +$${robBankReward}`,
          ...historyPrev.slice(0, 9)
        ]);
      } else if (robBankStatus === 'caught') {
        // Go to Jail
        setPlayerPositions(prev => {
          const updated = [...prev];
          updated[currentPlayer] = 28; // Jail index
          return updated;
        });
        
        setHistory(historyPrev => [
          `👮 ${players[currentPlayer].name} caught robbing bank! Go to Jail!`,
          ...historyPrev.slice(0, 9)
        ]);
      }
      
      // End turn
      setTimeout(() => {
        setCurrentPlayer(prev => (prev + 1) % players.length);
      }, 300);
    });
  };

  // Handle Tile Click (Open Property Details)
  const handleTileClick = (tileIndex) => {
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
    
    return patterns[value].map((show, i) => (
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
            <div className="money-pile">💰💵💎</div>
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
            <button className="roll-button" onClick={rollDice} tabIndex="-1">
              ROLL
            </button>
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
        {floatingPrices.map(fp => (
          <div 
            key={fp.key}
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
        {/* Top Controls */}
        <div className="top-controls">
          <button className="control-btn settings">⚙️</button>
          <button className="control-btn sound">🔊</button>
          <button className="control-btn help">❓</button>
          <button className="control-btn menu">☰</button>
        </div>

        {/* Player Panel */}
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
              background: robBankStatus === 'caught' 
                ? 'linear-gradient(to bottom, #C62828 0%, #B71C1C 100%)' 
                : robBankStatus === 'success'
                  ? 'linear-gradient(to bottom, #2E7D32 0%, #1B5E20 100%)'
                  : 'linear-gradient(to bottom, #1A237E 0%, #0D47A1 100%)' 
            }}>
              <span className="modal-heading-text">
                {robBankStatus === 'processing' ? 'ROBBING...' : 
                 robBankStatus === 'success' ? 'SUCCESS!' : 
                 robBankStatus === 'caught' ? 'BUSTED!' : 'ROB BANK'}
              </span>
            </div>
            
            {/* Body */}
            <div className="modal-body">
              {robBankStatus === 'idle' && (
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

              {robBankStatus === 'processing' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div className="modal-city-name" style={{ fontSize: '24px', marginBottom: '20px' }}>CRACKING SAFE...</div>
                  
                  <div className="cracking-progress">
                    <div className="cracking-bar"></div>
                  </div>
                </div>
              )}

              {robBankStatus === 'success' && (
                <>
                  <div className="modal-city-name" style={{ color: '#2E7D32' }}>YOU STOLE</div>
                  <div className="modal-city-name" style={{ fontSize: '40px', color: '#2E7D32', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    ${robBankReward.toLocaleString()}
                  </div>
                  <div className="modal-buttons" style={{ marginTop: '20px' }}>
                    <button className="modal-btn buy" onClick={handleRobBankComplete} style={{ width: '100%' }}>COLLECT</button>
                  </div>
                </>
              )}

              {robBankStatus === 'caught' && (
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
    </div>
    </>
  );
}

export default App;
