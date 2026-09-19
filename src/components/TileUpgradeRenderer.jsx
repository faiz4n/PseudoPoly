import React from 'react';
import houseImg from '../assets/upgrades/house_3d.png';
import hotelImg from '../assets/upgrades/hotel_3d.png';

/**
 * Renders 3D houses or hotel directly on a property tile.
 * @param {number} level - Upgrade tier: 0 (none), 1-4 (houses), 5 (hotel)
 * @param {'horizontal' | 'vertical'} orientation - Tile orientation
 * @param {'bottom' | 'top' | 'left' | 'right'} side - Which side of the board
 */
export default function TileUpgradeRenderer({ level = 0, orientation = 'horizontal', side = 'bottom' }) {
  if (!level || level <= 0) return null;

  const isHotel = level >= 5;

  return (
    <div
      className={`tile-upgrade-strip ${orientation} ${side}`}
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        pointerEvents: 'none',
        zIndex: 4,
        ...(side === 'bottom'
          ? { top: '3%', left: 0, right: 0, height: '24%' }
          : side === 'top'
          ? { bottom: '3%', left: 0, right: 0, height: '24%' }
          : side === 'left'
          ? { right: '3%', top: 0, bottom: 0, width: '24%', flexDirection: 'column' }
          : { left: '3%', top: 0, bottom: 0, width: '24%', flexDirection: 'column' }),
      }}
    >
      {isHotel ? (
        <img
          src={hotelImg}
          alt="Hotel"
          style={{
            height: orientation === 'horizontal' ? '90%' : 'auto',
            width: orientation === 'vertical' ? '90%' : 'auto',
            maxHeight: '26px',
            maxWidth: '38px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
          }}
          draggable={false}
        />
      ) : (
        Array.from({ length: Math.min(level, 4) }).map((_, i) => (
          <img
            key={i}
            src={houseImg}
            alt="House"
            style={{
              height: orientation === 'horizontal' ? '80%' : 'auto',
              width: orientation === 'vertical' ? '80%' : 'auto',
              maxHeight: '18px',
              maxWidth: '18px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))',
            }}
            draggable={false}
          />
        ))
      )}
    </div>
  );
}
