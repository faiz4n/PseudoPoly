/**
 * PseudoPoly AI Bot Decision Engine
 * Heuristic-driven deterministic decisions inspired by reference board game AI (cp::RobotPlayerController).
 */

import { COLOR_GROUPS } from '../data/boardData';
import { RENT_DATA } from '../data/rentData';

// Safe cash reserves bots maintain before discretionary spending
const SAFE_CASH_BUFFER = 1500;
const AGGRESSIVE_BUY_BUFFER = 400;

/**
 * Checks if buying/acquiring this tile completes a full color monopoly for the player.
 */
export function completesMonopoly(tileIndex, playerIndex, propertyOwnership) {
  const colorGroup = Object.values(COLOR_GROUPS).find((tiles) =>
    tiles.includes(tileIndex)
  );
  if (!colorGroup) return false;

  return colorGroup.every((t) => {
    if (t === tileIndex) return true; // Tile being evaluated
    return propertyOwnership[t] === playerIndex;
  });
}

/**
 * Checks if an opponent is 1 tile away from completing a monopoly and this tile blocks them.
 */
export function blocksOpponentMonopoly(tileIndex, playerIndex, propertyOwnership) {
  const colorGroup = Object.values(COLOR_GROUPS).find((tiles) =>
    tiles.includes(tileIndex)
  );
  if (!colorGroup) return false;

  // Group by opponents
  const opponentCounts = {};
  colorGroup.forEach((t) => {
    const owner = propertyOwnership[t];
    if (owner !== undefined && owner !== null && owner !== playerIndex) {
      opponentCounts[owner] = (opponentCounts[owner] || 0) + 1;
    }
  });

  // If any opponent owns all other properties in this group
  return Object.values(opponentCounts).some((count) => count === colorGroup.length - 1);
}

/**
 * Decides whether the bot should purchase an unowned property.
 */
export function shouldBotBuyProperty({
  botMoney,
  propertyPrice,
  tileIndex,
  botIndex,
  propertyOwnership,
}) {
  if (botMoney < propertyPrice) return false;

  const remainingCash = botMoney - propertyPrice;

  // Rule 1: Always complete your own monopoly if you have enough money
  if (completesMonopoly(tileIndex, botIndex, propertyOwnership)) {
    return true;
  }

  // Rule 2: Aggressively block an opponent's monopoly
  if (blocksOpponentMonopoly(tileIndex, botIndex, propertyOwnership)) {
    return remainingCash >= AGGRESSIVE_BUY_BUFFER;
  }

  // Rule 3: General purchase with safety buffer
  return remainingCash >= SAFE_CASH_BUFFER;
}

/**
 * Decides whether the bot should pay bail to leave jail immediately.
 */
export function shouldBotPayBail({
  botMoney,
  bailAmount,
  totalHousesOnBoard = 0,
}) {
  if (botMoney < bailAmount) return false;

  // Late game strategy (danger zone): If opponents built 4+ houses/hotels,
  // staying in jail is safer to avoid paying huge rents!
  if (totalHousesOnBoard >= 4 && botMoney < 3000) {
    return false; // Stay in jail, try rolling doubles
  }

  // Early/Mid game: Bot wants to be on the board buying/trading
  return botMoney >= bailAmount + 1000;
}

/**
 * Evaluates best possible property swap for the bot on Tile 7.
 * Returns { giveTile, receiveTile } or null if no favorable swap is found.
 */
export function evaluateBotSwap({
  botIndex,
  propertyOwnership,
  propertyLevels,
  botMoney,
}) {
  // Swapping costs $2,000 fee
  if (botMoney < 2000) return null;

  // Bot's tradeable single properties (no houses)
  const myTradeable = Object.keys(propertyOwnership)
    .map(Number)
    .filter((t) => {
      if (propertyOwnership[t] !== botIndex) return false;
      const group = Object.values(COLOR_GROUPS).find((tiles) => tiles.includes(t));
      if (group && group.some((gt) => (propertyLevels[gt] || 0) > 0)) return false;
      // Do not give away a property that is part of a monopoly
      if (group && group.every((gt) => propertyOwnership[gt] === botIndex)) return false;
      return true;
    });

  if (myTradeable.length === 0) return null;

  // Opponents' tradeable properties
  const oppTradeable = Object.keys(propertyOwnership)
    .map(Number)
    .filter((t) => {
      const owner = propertyOwnership[t];
      if (owner === undefined || owner === null || owner === botIndex) return false;
      const group = Object.values(COLOR_GROUPS).find((tiles) => tiles.includes(t));
      if (group && group.some((gt) => (propertyLevels[gt] || 0) > 0)) return false;
      return true;
    });

  if (oppTradeable.length === 0) return null;

  // Priority 1: Check if any opponent property completes a monopoly for the bot
  for (const oppTile of oppTradeable) {
    if (completesMonopoly(oppTile, botIndex, propertyOwnership)) {
      // Pick the least valuable property to give
      const giveTile = myTradeable[0];
      return { giveTile, receiveTile: oppTile };
    }
  }

  // Priority 2: Check if any opponent property blocks an opponent from completing a monopoly
  for (const oppTile of oppTradeable) {
    const oppOwner = propertyOwnership[oppTile];
    if (blocksOpponentMonopoly(oppTile, oppOwner, propertyOwnership)) {
      const giveTile = myTradeable[0];
      return { giveTile, receiveTile: oppTile };
    }
  }

  return null;
}

/**
 * Calculates the bot's maximum bid for an active auction.
 */
export function getBotMaxAuctionBid({
  botMoney,
  property,
  tileIndex,
  botIndex,
  propertyOwnership,
}) {
  const basePrice = property.price || property.cost || 1000;
  let multiplier = 1.15;

  if (completesMonopoly(tileIndex, botIndex, propertyOwnership)) {
    multiplier = 2.2; // High priority to win monopoly
  } else if (blocksOpponentMonopoly(tileIndex, botIndex, propertyOwnership)) {
    multiplier = 1.5; // Worth bidding higher to block
  }

  const maxValuation = Math.floor(basePrice * multiplier);
  const affordableLimit = Math.max(0, botMoney - 500);

  return Math.min(maxValuation, affordableLimit);
}

/**
 * Evaluates whether a bot should accept an incoming deal offer.
 */
export function shouldBotAcceptDeal({
  botIndex,
  deal,
  propertyOwnership,
  propertyLevels,
  botMoney,
}) {
  const { giveProperties = [], receiveProperties = [], moneyOffer = 0 } = deal;
  // From recipient perspective:
  // giveProperties = what proposer gives (so what the bot receives)
  // receiveProperties = what recipient gives (so what the bot gives up)
  // moneyOffer > 0: proposer pays recipient (bot gains cash)
  // moneyOffer < 0: recipient pays proposer (bot loses cash)

  const propsBotGives = receiveProperties;
  const propsBotReceives = giveProperties;
  const netCashForBot = moneyOffer;

  // 1. Bot cannot afford negative cash
  if (netCashForBot < 0 && botMoney + netCashForBot < 500) {
    return false;
  }

  // 2. Never break an existing monopoly owned by the bot
  for (const t of propsBotGives) {
    const group = Object.values(COLOR_GROUPS).find((tiles) => tiles.includes(t));
    if (group) {
      const ownsAll = group.every((gt) => propertyOwnership[gt] === botIndex);
      if (ownsAll) return false;
      if (group.some((gt) => (propertyLevels[gt] || 0) > 0)) return false;
    }
  }

  // 3. Check monopolies
  const simulatedOwnership = { ...propertyOwnership };
  propsBotGives.forEach((t) => delete simulatedOwnership[t]);
  propsBotReceives.forEach((t) => (simulatedOwnership[t] = botIndex));

  let givesBotMonopoly = false;
  for (const t of propsBotReceives) {
    const group = Object.values(COLOR_GROUPS).find((tiles) => tiles.includes(t));
    if (group && group.every((gt) => simulatedOwnership[gt] === botIndex)) {
      givesBotMonopoly = true;
      break;
    }
  }

  let givesOpponentMonopoly = false;
  const proposer = deal.proposer;
  for (const t of propsBotGives) {
    const group = Object.values(COLOR_GROUPS).find((tiles) => tiles.includes(t));
    if (group && group.every((gt) => simulatedOwnership[gt] === proposer)) {
      givesOpponentMonopoly = true;
      break;
    }
  }

  // If opponent gets monopoly and bot doesn't: REJECT
  if (givesOpponentMonopoly && !givesBotMonopoly) {
    return false;
  }

  // If bot gets monopoly and opponent doesn't: ACCEPT!
  if (givesBotMonopoly && !givesOpponentMonopoly) {
    return true;
  }

  // 4. Financial valuation comparison
  let valueReceived = netCashForBot;
  propsBotReceives.forEach((t) => {
    const price = RENT_DATA[t]?.price || 1000;
    valueReceived += price;
  });

  let valueGiven = 0;
  propsBotGives.forEach((t) => {
    const price = RENT_DATA[t]?.price || 1000;
    valueGiven += price;
  });

  if (givesBotMonopoly) valueReceived += 1500;
  if (givesOpponentMonopoly) valueGiven += 1500;

  return valueReceived >= valueGiven;
}

/**
 * Generates a strategic deal offer if the bot is 1 property away from a monopoly.
 */
export function generateBotDealOffer({
  botIndex,
  gamePlayers,
  propertyOwnership,
  propertyLevels,
  botMoney,
  bankruptPlayers = {},
}) {
  if (botMoney < 1500) return null;

  for (const group of Object.values(COLOR_GROUPS)) {
    const missingInGroup = group.filter((t) => propertyOwnership[t] !== botIndex);
    if (missingInGroup.length === 1) {
      const targetTile = missingInGroup[0];
      const targetOwner = propertyOwnership[targetTile];

      if (
        targetOwner === undefined ||
        targetOwner === null ||
        targetOwner === botIndex ||
        bankruptPlayers[targetOwner] ||
        gamePlayers[targetOwner]?.kicked
      ) {
        continue;
      }

      const targetGroup = Object.values(COLOR_GROUPS).find((tiles) => tiles.includes(targetTile));
      if (targetGroup && targetGroup.some((t) => (propertyLevels[t] || 0) > 0)) {
        continue;
      }

      const candidateGiveTiles = Object.keys(propertyOwnership)
        .map(Number)
        .filter((t) => {
          if (propertyOwnership[t] !== botIndex) return false;
          const g = Object.values(COLOR_GROUPS).find((tiles) => tiles.includes(t));
          if (!g) return true;
          if (g.some((gt) => (propertyLevels[gt] || 0) > 0)) return false;
          if (g.every((gt) => propertyOwnership[gt] === botIndex)) return false;
          if (g.includes(targetTile)) return false;
          return true;
        });

      if (candidateGiveTiles.length === 0) continue;

      const giveTile = candidateGiveTiles[0];
      const givePrice = RENT_DATA[giveTile]?.price || 1000;
      const targetPrice = RENT_DATA[targetTile]?.price || 1000;

      const cashDifference = Math.max(0, targetPrice - givePrice) + 300;
      if (botMoney < cashDifference + 1000) continue;

      return {
        proposer: botIndex,
        recipient: targetOwner,
        giveProperties: [giveTile],
        receiveProperties: [targetTile],
        moneyOffer: cashDifference,
      };
    }
  }

  return null;
}
