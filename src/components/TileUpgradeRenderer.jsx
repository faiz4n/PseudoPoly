import React from 'react';
import houseImg from '../assets/upgrades/house_3d.png';
import hotelImg from '../assets/upgrades/hotel_3d.png';

/**
 * Renders 3D houses or hotel directly on a property tile.
 * Houses are sized appropriately to fit within their tile boundaries.
 * @param {number} level - Upgrade tier: 0 (none), 1-4 (houses), 5 (hotel)
 * @param {'horizontal' | 'vertical'} orientation - Tile orientation
 * @param {'bottom' | 'top' | 'left' | 'right'} side - Which side of the board
 */
function TileUpgradeRenderer({ level = 0, orientation = 'horizontal', side = 'bottom' }) {
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
        gap: '1.5px',
        pointerEvents: 'none',
        zIndex: 4,
        top: '2px',
        left: 0,
        right: 0,
        height: 'auto',
      }}
    >
      {isHotel ? (
        <img
          src={hotelImg}
          alt="Hotel"
          style={{
            height: 'auto',
            width: 'auto',
            maxHeight: '8px',
            maxWidth: '12px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
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
              height: 'auto',
              width: 'auto',
              maxHeight: '6px',
              maxWidth: '5.5px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0.5px 1px rgba(0,0,0,0.35))',
            }}
            draggable={false}
          />
        ))
      )}
    </div>
  );
}

export default React.memo(TileUpgradeRenderer);
