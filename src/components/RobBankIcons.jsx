import React from "react";

/**
 * Custom SVG Icon for "BUSTED / JAIL" outcome
 * Theme: Steel prison bars, red handcuffs, flashing police beacon
 */
export function BustedJailIcon({ size = 26, className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`busted-jail-svg ${className}`}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    >
      <circle cx="24" cy="24" r="22" fill="#FFEBEE" opacity="0.65" />
      <rect x="9" y="6" width="3" height="36" rx="1.5" fill="#78909C" opacity="0.7" />
      <rect x="19" y="6" width="3" height="36" rx="1.5" fill="#78909C" opacity="0.7" />
      <rect x="26" y="6" width="3" height="36" rx="1.5" fill="#78909C" opacity="0.7" />
      <rect x="36" y="6" width="3" height="36" rx="1.5" fill="#78909C" opacity="0.7" />
      <path d="M21 9 L27 9 L28 15 L20 15 Z" fill="#D32F2F" />
      <circle cx="24" cy="8" r="3" fill="#FF5252" />
      <path d="M16 7 L13 5 M32 7 L35 5 M24 4 L24 2" stroke="#FF1744" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="29" r="8.5" stroke="#D32F2F" strokeWidth="3" fill="#FFFFFF" />
      <circle cx="16" cy="29" r="4.5" fill="#FFCDD2" />
      <rect x="14" y="18" width="4" height="4" rx="1" fill="#B71C1C" />
      <circle cx="32" cy="29" r="8.5" stroke="#D32F2F" strokeWidth="3" fill="#FFFFFF" />
      <circle cx="32" cy="29" r="4.5" fill="#FFCDD2" />
      <rect x="30" y="18" width="4" height="4" rx="1" fill="#B71C1C" />
      <path d="M21 29 C24 26 24 26 27 29" stroke="#C62828" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Custom SVG Icon for "ESCAPED EMPTY-HANDED" outcome
 * Theme: Bandit silhouette running with mask & beanie, speed wind streaks, empty loot bag
 */
export function EscapedThiefIcon({ size = 26, className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`escaped-thief-svg ${className}`}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    >
      <circle cx="24" cy="24" r="22" fill="#FFF3E0" opacity="0.75" />
      <path d="M5 23 H15 M3 29 H13 M6 35 H17" stroke="#FB8C00" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <circle cx="10" cy="26" r="3" fill="#FFA726" opacity="0.45" />
      <circle cx="16" cy="32" r="2.2" fill="#FFA726" opacity="0.4" />
      <circle cx="33" cy="13" r="6" fill="#37474F" />
      <path d="M27 12 C28 6 38 6 39 12 Z" fill="#E65100" />
      <path d="M28 13 Q33 11 38 13 Q38 16 33 15 Q28 16 28 13 Z" fill="#212121" />
      <circle cx="31" cy="13.2" r="1.1" fill="#FFFFFF" />
      <circle cx="35" cy="13.2" r="1.1" fill="#FFFFFF" />
      <path d="M24 20 C18 20 17 26 21 28 C23 29 25 25 24 20 Z" fill="#8D6E63" stroke="#4E342E" strokeWidth="1.6" />
      <path d="M22 21 L20 18" stroke="#D7CCC8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M30 19 L25 29 L31 34 L27 44" stroke="#FB8C00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 29 L35 27 L43 37" stroke="#E65100" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 21 L36 23 L41 19" stroke="#FB8C00" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Custom SVG Icon for "ROB BANK / VAULT JACKPOT" outcome
 * Theme: Heavy circular bank vault door, gold coin mounds, sparkling diamond gem
 */
export function VaultDiamondIcon({ size = 26, className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`vault-diamond-svg ${className}`}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    >
      <circle cx="24" cy="24" r="22" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="2.5" />
      <circle cx="24" cy="5.5" r="1.6" fill="#1B5E20" />
      <circle cx="24" cy="42.5" r="1.6" fill="#1B5E20" />
      <circle cx="5.5" cy="24" r="1.6" fill="#1B5E20" />
      <circle cx="42.5" cy="24" r="1.6" fill="#1B5E20" />
      <circle cx="11" cy="11" r="1.5" fill="#1B5E20" />
      <circle cx="37" cy="11" r="1.5" fill="#1B5E20" />
      <circle cx="11" cy="37" r="1.5" fill="#1B5E20" />
      <circle cx="37" cy="37" r="1.5" fill="#1B5E20" />
      <ellipse cx="18" cy="36" rx="7" ry="2.5" fill="#FFA000" stroke="#FF6F00" strokeWidth="1" />
      <ellipse cx="18" cy="33" rx="7" ry="2.5" fill="#FFD54F" stroke="#FFA000" strokeWidth="1" />
      <ellipse cx="30" cy="37" rx="6.5" ry="2.3" fill="#FFA000" stroke="#FF6F00" strokeWidth="1" />
      <ellipse cx="30" cy="34" rx="6.5" ry="2.3" fill="#FFD54F" stroke="#FFA000" strokeWidth="1" />
      <polygon points="24,10 35,18 24,31 13,18" fill="#00E5FF" stroke="#00B0FF" strokeWidth="1.2" />
      <polygon points="24,10 28,18 24,31 20,18" fill="#E0F7FA" />
      <polygon points="17,11 24,10 20,18 13,18" fill="#80DEEA" />
      <polygon points="31,11 24,10 28,18 35,18" fill="#4DD0E1" />
      <path d="M36 10 L37.5 13 L40.5 14.5 L37.5 16 L36 19 L34.5 16 L31.5 14.5 L34.5 13 Z" fill="#FFFFFF" />
      <path d="M11 18 L12 20 L14 21 L12 22 L11 24 L10 22 L8 21 L10 20 Z" fill="#FFF9C4" />
    </svg>
  );
}
