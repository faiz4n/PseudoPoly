// Board data for Monopoly game
// EXACT color assignments per user specification
// Icons ONLY on special tiles (Chance, Train, Robber, Tax, Chest)
import avatarBlue from '../assets/avatar_blue_glossy.png';
import avatarBlack from '../assets/avatar_black_glossy.png';
import avatarOrange from '../assets/avatar_orange_glossy.png';
import avatarWhite from '../assets/avatar_white_glossy.png';
import avatarRed from '../assets/avatar_red.png';
import avatarGreen from '../assets/avatar_green.png';

export {
  avatarBlue,
  avatarBlack,
  avatarOrange,
  avatarWhite,
  avatarRed,
  avatarGreen,
};

// Base Avatar to Color mapping
const BASE_AVATAR_COLORS = {
  [avatarOrange]: '#E64A19',  // Orange
  [avatarBlue]: '#2196F3',    // Blue
  [avatarWhite]: '#E0E0E0',   // White
  [avatarBlack]: '#1A1A1A',   // Black
  [avatarRed]: '#E53935',     // Red
  [avatarGreen]: '#43A047',   // Green
  '/avatar_red.png': '#E53935',
  'avatar_red.png': '#E53935',
  'avatar_red': '#E53935',
  'red': '#E53935',
  '/avatar_green.png': '#43A047',
  'avatar_green.png': '#43A047',
  'avatar_green': '#43A047',
  'green': '#43A047',
  'avatar_orange_glossy': '#E64A19',
  'avatar_blue_glossy': '#2196F3',
  'avatar_white_glossy': '#E0E0E0',
  'avatar_black_glossy': '#1A1A1A',
};

// Robust helper to get the avatar's theme color
export function getAvatarColor(avatar) {
  if (!avatar) return '#ffd700';
  if (BASE_AVATAR_COLORS[avatar]) return BASE_AVATAR_COLORS[avatar];
  const s = String(avatar).toLowerCase();
  if (s.includes('red')) return '#E53935';
  if (s.includes('green')) return '#43A047';
  if (s.includes('orange')) return '#E64A19';
  if (s.includes('blue')) return '#2196F3';
  if (s.includes('white')) return '#E0E0E0';
  if (s.includes('black')) return '#1A1A1A';
  return '#ffd700';
}

// Robust helper to resolve any avatar string/identifier to the imported asset
export function resolveAvatar(avatar) {
  if (!avatar) return avatarOrange;
  if (typeof avatar !== 'string') return avatar;
  const s = avatar.toLowerCase();
  if (s.includes('red')) return avatarRed;
  if (s.includes('green')) return avatarGreen;
  if (s.includes('orange')) return avatarOrange;
  if (s.includes('blue')) return avatarBlue;
  if (s.includes('white')) return avatarWhite;
  if (s.includes('black')) return avatarBlack;
  return avatar;
}

// Proxy wrapper so AVATAR_COLORS[any] always resolves accurately
export const AVATAR_COLORS = new Proxy(BASE_AVATAR_COLORS, {
  get(target, prop) {
    if (typeof prop !== 'string') return target[prop];
    if (target[prop]) return target[prop];
    return getAvatarColor(prop);
  },
});

// Choosable avatar options for UI pickers
export const CHOOSABLE_AVATARS = [
  { id: 'orange', avatar: avatarOrange, color: '#E64A19', name: 'Orange' },
  { id: 'blue', avatar: avatarBlue, color: '#2196F3', name: 'Blue' },
  { id: 'white', avatar: avatarWhite, color: '#E0E0E0', name: 'White' },
  { id: 'black', avatar: avatarBlack, color: '#1A1A1A', name: 'Black' },
  { id: 'red', avatar: avatarRed, color: '#E53935', name: 'Red' },
  { id: 'green', avatar: avatarGreen, color: '#43A047', name: 'Green' },
];

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
  { id: 3, name: 'Cash Stack', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.CASH_STACK, icon: 'cash_stack' },
  { id: 4, name: 'Train', price: 1000, color: PROPERTY_COLORS.special, type: SPACE_TYPES.RAILROAD, icon: 'train' },
  { id: 5, name: 'Service station', price: 600, color: PROPERTY_COLORS.yellow, type: SPACE_TYPES.PROPERTY },
  { id: 6, name: 'Swim. pool', price: 700, color: PROPERTY_COLORS.red, type: SPACE_TYPES.PROPERTY },
  { id: 7, name: 'The Audit', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.AUDIT, icon: 'audit' },
  { id: 8, name: 'Zoo', price: 800, color: PROPERTY_COLORS.red, type: SPACE_TYPES.PROPERTY },
  { id: 9, name: 'Ice-rink', price: 900, color: PROPERTY_COLORS.red, type: SPACE_TYPES.PROPERTY },
];


export const leftColumn = [
  { id: 11, name: 'Pizzeria', price: 1000, color: PROPERTY_COLORS.pink, type: SPACE_TYPES.PROPERTY },
  { id: 12, name: 'Cinema', price: 1100, color: PROPERTY_COLORS.pink, type: SPACE_TYPES.PROPERTY },
  { id: 13, name: 'Train', price: 1000, color: PROPERTY_COLORS.special, type: SPACE_TYPES.RAILROAD, icon: 'train' },
  { id: 14, name: 'Night club', price: 1200, color: PROPERTY_COLORS.pink, type: SPACE_TYPES.PROPERTY },
  { id: 15, name: 'Airport', price: 1300, color: PROPERTY_COLORS.darkOrange, type: SPACE_TYPES.PROPERTY },
  { id: 16, name: 'Car salon', price: 1400, color: PROPERTY_COLORS.darkOrange, type: SPACE_TYPES.PROPERTY },
  { id: 17, name: 'Harbor', price: 1500, color: PROPERTY_COLORS.darkOrange, type: SPACE_TYPES.PROPERTY },
];

export const topRow = [
  { id: 19, name: 'News paper', price: 1600, color: PROPERTY_COLORS.lightGreen, type: SPACE_TYPES.PROPERTY },
  { id: 20, name: 'TV channel', price: 1700, color: PROPERTY_COLORS.lightGreen, type: SPACE_TYPES.PROPERTY },
  { id: 21, name: 'Train', price: 1000, color: PROPERTY_COLORS.special, type: SPACE_TYPES.RAILROAD, icon: 'train' },
  { id: 22, name: 'Mobile op.', price: 1800, color: PROPERTY_COLORS.lightGreen, type: SPACE_TYPES.PROPERTY },
  { id: 23, name: 'Chance', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.CHANCE, icon: 'chance' },
  { id: 24, name: 'Toy factory', price: 1900, color: PROPERTY_COLORS.purple, type: SPACE_TYPES.PROPERTY },
  { id: 25, name: 'Candy factory', price: 2000, color: PROPERTY_COLORS.purple, type: SPACE_TYPES.PROPERTY },
  { id: 26, name: 'Property War', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.PROPERTY_WAR, icon: 'property_war' },
  { id: 27, name: 'Organic farm', price: 2100, color: PROPERTY_COLORS.purple, type: SPACE_TYPES.PROPERTY },
];

// Right column (top to bottom) - REMOVED Shopping mall
export const rightColumn = [
  { id: 29, name: 'Oil well', price: 2200, color: PROPERTY_COLORS.darkGreen, type: SPACE_TYPES.PROPERTY },
  { id: 30, name: 'Diamond mine', price: 2300, color: PROPERTY_COLORS.darkGreen, type: SPACE_TYPES.PROPERTY },
  { id: 31, name: 'Forced Auction', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.FORCED_AUCTION, icon: 'forced_auction' },
  { id: 32, name: 'Train', price: 1000, color: PROPERTY_COLORS.special, type: SPACE_TYPES.RAILROAD, icon: 'train' },
  { id: 33, name: 'Chest', price: null, color: PROPERTY_COLORS.special, type: SPACE_TYPES.CHEST, icon: 'chest' },
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
