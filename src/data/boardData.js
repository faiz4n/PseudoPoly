// Board data for Monopoly game
// EXACT color assignments per user specification
// Icons ONLY on special tiles (Chance, Train, Robber, Tax, Chest)
import avatarBlue from '../assets/avatar_blue_glossy.png';
import avatarBlack from '../assets/avatar_black_glossy.png';
import avatarOrange from '../assets/avatar_orange_glossy.png';
import avatarWhite from '../assets/avatar_white_glossy.png';

// Avatar to Color mapping (use avatar path as key)
export const AVATAR_COLORS = {
  [avatarOrange]: '#E64A19',  // Orange
  [avatarBlue]: '#2196F3',     // Blue
  [avatarWhite]: '#E0E0E0',    // White
  [avatarBlack]: '#1A1A1A',    // Black
};

export const PROPERTY_COLORS = {
  yellow: '#ffb900',
  red: '#fc1d1e',
  pink: '#fe4c9a',
  darkOrange: '#ff7900',
  lightGreen: '#8ccb7c',
  purple: '#bf3ee3',
  darkGreen: '#369f1e',
  limeGreen: '#97d431',
  special: '#e0ca9b',
};

export const SPACE_TYPES = {
  PROPERTY: 'property',
  RAILROAD: 'railroad',
  UTILITY: 'utility',
  CHANCE: 'chance',
  CHEST: 'chest',
  CASH_STACK: 'cash_stack',
  PROPERTY_WAR: 'property_war',
  AUDIT: 'audit',
  FORCED_AUCTION: 'forced_auction',
  CORNER: 'corner',
};


export const bottomRow = [
  { id: 1, name: 'Shop', price: 400, color: PROPERTY_COLORS.yellow, type: SPACE_TYPES.PROPERTY },
  { id: 2, name: 'Super market', price: 500, color: PROPERTY_COLORS.yellow, type: SPACE_TYPES.PROPERTY },
  { id: 3, name: 'Cash Stack', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.CASH_STACK, icon: '💵' },
  { id: 4, name: 'Train', price: 1000, color: PROPERTY_COLORS.special, type: SPACE_TYPES.RAILROAD, icon: '🚅' },
  { id: 5, name: 'Service station', price: 600, color: PROPERTY_COLORS.yellow, type: SPACE_TYPES.PROPERTY },
  { id: 6, name: 'Swim. pool', price: 700, color: PROPERTY_COLORS.red, type: SPACE_TYPES.PROPERTY },
  { id: 7, name: 'The Audit', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.AUDIT, icon: '🧾' },
  { id: 8, name: 'Zoo', price: 800, color: PROPERTY_COLORS.red, type: SPACE_TYPES.PROPERTY },
  { id: 9, name: 'Ice-rink', price: 900, color: PROPERTY_COLORS.red, type: SPACE_TYPES.PROPERTY },
];


export const leftColumn = [
  { id: 11, name: 'Pizzeria', price: 1000, color: PROPERTY_COLORS.pink, type: SPACE_TYPES.PROPERTY },
  { id: 12, name: 'Cinema', price: 1100, color: PROPERTY_COLORS.pink, type: SPACE_TYPES.PROPERTY },
  { id: 13, name: 'Train', price: 1000, color: PROPERTY_COLORS.special, type: SPACE_TYPES.RAILROAD, icon: '🚅' },
  { id: 14, name: 'Night club', price: 1200, color: PROPERTY_COLORS.pink, type: SPACE_TYPES.PROPERTY },
  { id: 15, name: 'Airport', price: 1300, color: PROPERTY_COLORS.darkOrange, type: SPACE_TYPES.PROPERTY },
  { id: 16, name: 'Car salon', price: 1400, color: PROPERTY_COLORS.darkOrange, type: SPACE_TYPES.PROPERTY },
  { id: 17, name: 'Harbor', price: 1500, color: PROPERTY_COLORS.darkOrange, type: SPACE_TYPES.PROPERTY },
];

export const topRow = [
  { id: 19, name: 'News paper', price: 1600, color: PROPERTY_COLORS.lightGreen, type: SPACE_TYPES.PROPERTY },
  { id: 20, name: 'TV channel', price: 1700, color: PROPERTY_COLORS.lightGreen, type: SPACE_TYPES.PROPERTY },
  { id: 21, name: 'Train', price: 1000, color: PROPERTY_COLORS.special, type: SPACE_TYPES.RAILROAD, icon: '🚅' },
  { id: 22, name: 'Mobile op.', price: 1800, color: PROPERTY_COLORS.lightGreen, type: SPACE_TYPES.PROPERTY },
  { id: 23, name: 'Forced Auction', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.FORCED_AUCTION, icon: '🔨' },
  { id: 24, name: 'Toy factory', price: 1900, color: PROPERTY_COLORS.purple, type: SPACE_TYPES.PROPERTY },
  { id: 25, name: 'Candy factory', price: 2000, color: PROPERTY_COLORS.purple, type: SPACE_TYPES.PROPERTY },
  { id: 26, name: 'Property War', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.PROPERTY_WAR, icon: '⚔️' },
  { id: 27, name: 'Organic farm', price: 2100, color: PROPERTY_COLORS.purple, type: SPACE_TYPES.PROPERTY },
];

// Right column (top to bottom) - REMOVED Shopping mall
export const rightColumn = [
  { id: 29, name: 'Oil well', price: 2200, color: PROPERTY_COLORS.darkGreen, type: SPACE_TYPES.PROPERTY },
  { id: 30, name: 'Diamond mine', price: 2300, color: PROPERTY_COLORS.darkGreen, type: SPACE_TYPES.PROPERTY },
  { id: 31, name: 'Chance', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.CHANCE, icon: '❓' },
  { id: 32, name: 'Train', price: 1000, color: PROPERTY_COLORS.special, type: SPACE_TYPES.RAILROAD, icon: '🚅' },
  { id: 33, name: 'Chest', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.CHEST, icon: '📦' },
  { id: 34, name: 'Hollywood', price: 2400, color: PROPERTY_COLORS.limeGreen, type: SPACE_TYPES.PROPERTY },
  { id: 35, name: 'Electronics factory', price: 2500, color: PROPERTY_COLORS.limeGreen, type: SPACE_TYPES.PROPERTY },
];

// Corner spaces
export const corners = {
  bottomRight: { id: 0, name: 'START', type: 'start', color: '#4CAF50' },
  bottomLeft: { id: 'parking', name: 'PARKING', type: 'parking', color: '#2196F3', icon: 'P' },
  topLeft: { id: 'robbank', name: 'ROB BANK', type: 'robbank', color: '#1A237E' },
  topRight: { id: 'jail', name: 'JAIL', type: 'jail', color: '#FF9800' },
};

// Players data
export const players = [
  { id: 3, name: 'PLAYER 2', money: 12500, avatar: avatarOrange, color: '#E64A19' },  // Orange
  { id: 1, name: 'PLAYER 3', money: 12500, avatar: avatarBlue, color: '#2196F3' },    // Blue
  { id: 4, name: 'FAIZAN', money: 12500, avatar: avatarWhite, color: '#E0E0E0' },     // White/Light Gray
  { id: 2, name: 'PLAYER 4', money: 12500, avatar: avatarBlack, color: '#212121' },   // Black/Dark
];
