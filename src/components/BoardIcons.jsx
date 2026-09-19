import React from 'react';
import trainImg from '../assets/travel_icon.png';
import cashImg from '../assets/tax_cash.png';
import chanceImg from '../assets/chance_dice.png';
import chestImg from '../assets/chest_box.png';

// 1. Cash Stack Icon (Reference App Bills & Coins)
export function CashStackIcon({ size = 22, className = '' }) {
  return (
    <img
      src={cashImg}
      alt="Cash Stack"
      style={{
        width: `${size}px`,
        height: 'auto',
        maxHeight: `${size}px`,
        objectFit: 'contain',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
      }}
      className={className}
      draggable={false}
    />
  );
}

// 2. Train / Railroad Icon (Reference App Modern Subway Train)
export function TrainIcon({ size = 26, className = '' }) {
  return (
    <img
      src={trainImg}
      alt="Train"
      style={{
        width: `${size}px`,
        height: 'auto',
        maxHeight: `${size}px`,
        objectFit: 'contain',
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))',
      }}
      className={className}
      draggable={false}
    />
  );
}

// 3. The Audit Icon (Tax clipboard / document)
export function AuditIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="auditGrad" x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF8E1" />
          <stop offset="100%" stopColor="#FFE082" />
        </linearGradient>
      </defs>
      <rect x="4" y="3" width="16" height="19" rx="2.5" fill="url(#auditGrad)" stroke="#B71C1C" strokeWidth="1.2" />
      <path d="M8.5 2H15.5C16 2 16.5 2.5 16.5 3V4.5H7.5V3C7.5 2.5 8 2 8.5 2Z" fill="#B71C1C" />
      <line x1="7" y1="7.5" x2="13" y2="7.5" stroke="#795548" strokeWidth="1" strokeLinecap="round" />
      <line x1="7" y1="10.5" x2="17" y2="10.5" stroke="#795548" strokeWidth="1" strokeLinecap="round" />
      <line x1="7" y1="13.5" x2="14" y2="13.5" stroke="#795548" strokeWidth="1" strokeLinecap="round" />
      <circle cx="14.5" cy="16.5" r="4" fill="#D32F2F" stroke="#FFCDD2" strokeWidth="0.8" />
      <text x="14.5" y="18.3" fontSize="4.2" fontWeight="900" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">%</text>
    </svg>
  );
}

// 4. Chance Icon (Reference App 3D Tumbling Red Dice)
export function ChanceIcon({ size = 22, className = '' }) {
  return (
    <img
      src={chanceImg}
      alt="Chance"
      style={{
        width: `${size}px`,
        height: 'auto',
        maxHeight: `${size}px`,
        objectFit: 'contain',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
      }}
      className={className}
      draggable={false}
    />
  );
}

// 5. Property War Icon (Crossed Swords)
export function PropertyWarIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="bladeGrad1" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ECEFF1" />
          <stop offset="100%" stopColor="#90A4AE" />
        </linearGradient>
      </defs>
      <path d="M19.5 4.5L14 10L12.5 8.5L18 3L21 3L21 6L19.5 4.5Z" fill="#FFB300" />
      <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" stroke="url(#bladeGrad1)" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17L7 20L5.5 21.5L2.5 18.5L4 17Z" fill="#D32F2F" />
      <path d="M4.5 4.5L10 10L11.5 8.5L6 3L3 3L3 6L4.5 4.5Z" fill="#FFB300" />
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke="url(#bladeGrad1)" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 17L17 20L18.5 21.5L21.5 18.5L20 17Z" fill="#D32F2F" />
      <circle cx="12" cy="12" r="2" fill="#FFEA00" stroke="#FF6D00" strokeWidth="0.8" />
    </svg>
  );
}

// 6. Forced Auction Icon (Gavel & Sound Block)
export function ForcedAuctionIcon({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id="gavelGrad" x1="0" y1="0" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8D6E63" />
          <stop offset="100%" stopColor="#4E342E" />
        </linearGradient>
      </defs>
      <rect x="4" y="19" width="16" height="3" rx="1.5" fill="#3E2723" stroke="#D7CCC8" strokeWidth="0.6" />
      <path d="M9 13L16.5 20.5" stroke="#A1887F" strokeWidth="2.2" strokeLinecap="round" />
      <g transform="rotate(45 9 8)">
        <rect x="4.5" y="5" width="9" height="6" rx="1.5" fill="url(#gavelGrad)" stroke="#D7CCC8" strokeWidth="0.8" />
        <rect x="7" y="4" width="4" height="8" rx="0.5" fill="#FFB300" opacity="0.8" />
      </g>
      <path d="M6 16C5 14 5 13 6 12" stroke="#FFB300" strokeWidth="1" strokeLinecap="round" />
      <path d="M12 16C13 14 13 13 12 12" stroke="#FFB300" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// 7. Community Chest Icon (Reference App Gold Treasure Chest)
export function ChestIcon({ size = 22, className = '' }) {
  return (
    <img
      src={chestImg}
      alt="Chest"
      style={{
        width: `${size}px`,
        height: 'auto',
        maxHeight: `${size}px`,
        objectFit: 'contain',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
      }}
      className={className}
      draggable={false}
    />
  );
}

// 8. Yacht Icon (Center Board Decoration)
export function YachtIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="yachtHull" x1="0" y1="16" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#B0BEC5" />
        </linearGradient>
      </defs>
      <path d="M2 26C5 25 8 27 11 26C14 25 17 27 20 26C23 25 26 27 29 26" stroke="#42A5F5" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 29C7 28 10 30 13 29C16 28 19 30 22 29C25 28 28 30 31 29" stroke="#1E88E5" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M4 22L7 25H25L29 20H8L4 22Z" fill="url(#yachtHull)" stroke="#37474F" strokeWidth="1" />
      <line x1="8" y1="23.5" x2="26" y2="23.5" stroke="#0D47A1" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 20L13 14H22L24 20H10Z" fill="#ECEFF1" stroke="#455A64" strokeWidth="0.8" />
      <rect x="14" y="15.5" width="3" height="2" rx="0.4" fill="#0D47A1" />
      <rect x="18" y="15.5" width="3.5" height="2" rx="0.4" fill="#0D47A1" />
      <line x1="17.5" y1="14" x2="17.5" y2="10" stroke="#78909C" strokeWidth="1" />
      <polygon points="17.5,10 21,11.5 17.5,13" fill="#E53935" />
    </svg>
  );
}

// 9. Master Icon Dispatcher
export default function BoardIcon({ type, size = 22, className = '' }) {
  if (!type) return null;

  switch (type) {
    case 'cash_stack':
    case '💵':
      return <CashStackIcon size={size} className={className} />;
    case 'train':
    case 'railroad':
    case '🚅':
      return <TrainIcon size={size} className={className} />;
    case 'audit':
    case '🧾':
      return <AuditIcon size={size} className={className} />;
    case 'chance':
    case '❓':
      return <ChanceIcon size={size} className={className} />;
    case 'property_war':
    case '⚔️':
      return <PropertyWarIcon size={size} className={className} />;
    case 'forced_auction':
    case '🔨':
      return <ForcedAuctionIcon size={size} className={className} />;
    case 'chest':
    case '📦':
      return <ChestIcon size={size} className={className} />;
    case 'yacht':
    case '🛥️':
      return <YachtIcon size={size} className={className} />;
    default:
      return <span className={`tile-icon-text ${className}`}>{type}</span>;
  }
}
