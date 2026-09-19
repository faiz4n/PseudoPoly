import React from 'react';
import houseImg from '../assets/upgrades/house_3d.png';
import hotelImg from '../assets/upgrades/hotel_3d.png';
import lvl1Img from '../assets/upgrades/level_1.png';
import lvl2Img from '../assets/upgrades/level_2.png';
import lvl3Img from '../assets/upgrades/level_3.png';
import lvl4Img from '../assets/upgrades/level_4.png';
import lvl5Img from '../assets/upgrades/level_5.png';
import mortgageStamp from '../assets/upgrades/mortgage_stamp.png';
import btnBlue from '../assets/btn_blue.png';

const LEVEL_ICONS = {
  1: lvl1Img,
  2: lvl2Img,
  3: lvl3Img,
  4: lvl4Img,
  5: lvl5Img,
};

export default function PropertyInfoModal({
  property,
  currentLevel = 0,
  owner = null,
  ownerName = null,
  ownerColor = null,
  isMortgaged = false,
  isClosing = false,
  onClose,
}) {
  if (!property) return null;

  const rentLevels = property.rentLevels || [];
  const isTrain = !!property.isTrain;
  const monopolyRent = (property.baseRent || property.price * 0.1) * 2;
  const mortgageValue = Math.round((property.price || 0) / 2);

  return (
    <div
      className={`modal-overlay ${isClosing ? 'closing' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '310px',
          maxWidth: '92vw',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          fontFamily: '"Nunito", sans-serif',
          border: '2px solid #E0E0E0',
          animation: 'modalSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header with Property Color Bar */}
        <div
          style={{
            backgroundColor: property.color || '#E0CA9B',
            padding: '14px 16px 12px',
            textAlign: 'center',
            position: 'relative',
            borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '12px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: 'none',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              color: '#FFFFFF',
              fontWeight: '900',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '1px',
              color: 'rgba(0, 0, 0, 0.55)',
              textTransform: 'uppercase',
            }}
          >
            {isTrain ? 'RAILROAD' : 'TITLE DEED'}
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: '900',
              color: '#1A1A1A',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.4)',
              lineHeight: 1.2,
              marginTop: '2px',
            }}
          >
            {property.name}
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '12px 16px 16px', position: 'relative' }}>
          {/* Mortgaged Stamp Overlay */}
          {isMortgaged && (
            <img
              src={mortgageStamp}
              alt="MORTGAGED"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-15deg)',
                width: '180px',
                pointerEvents: 'none',
                zIndex: 10,
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
              }}
            />
          )}

          {/* Owner Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              backgroundColor: '#F5F5F5',
              borderRadius: '8px',
              marginBottom: '10px',
              fontSize: '12px',
            }}
          >
            <span style={{ color: '#666', fontWeight: '600' }}>Owner:</span>
            {owner !== null && owner !== undefined && ownerName ? (
              <span
                style={{
                  fontWeight: '800',
                  color: ownerColor || '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: ownerColor || '#333',
                  }}
                />
                {ownerName}
              </span>
            ) : (
              <span style={{ color: '#888', fontStyle: 'italic' }}>Unowned</span>
            )}
          </div>

          {/* Rents Breakdown Table */}
          <div
            style={{
              border: '1px solid #EAEAEA',
              borderRadius: '10px',
              overflow: 'hidden',
              marginBottom: '12px',
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 10px',
                backgroundColor: '#F9F9F9',
                fontSize: '11px',
                fontWeight: '800',
                color: '#777',
                borderBottom: '1px solid #EAEAEA',
              }}
            >
              <span>TIER / LEVEL</span>
              <span>RENT</span>
            </div>

            {/* Base Rent */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                fontSize: '12px',
                backgroundColor: currentLevel === 0 ? 'rgba(76, 175, 80, 0.12)' : '#FFF',
                borderBottom: '1px solid #F0F0F0',
                fontWeight: currentLevel === 0 ? '800' : '600',
              }}
            >
              <span style={{ color: '#444' }}>Base Rent</span>
              <span style={{ color: currentLevel === 0 ? '#2E7D32' : '#222' }}>
                ${(property.baseRent || rentLevels[0] || 0).toLocaleString()}
              </span>
            </div>

            {/* Monopoly Rent (Non-train) */}
            {!isTrain && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  fontSize: '12px',
                  backgroundColor: '#FFF',
                  borderBottom: '1px solid #F0F0F0',
                  fontWeight: '600',
                }}
              >
                <span style={{ color: '#E65100', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ★ Monopoly (Full Set)
                </span>
                <span style={{ color: '#E65100' }}>${monopolyRent.toLocaleString()}</span>
              </div>
            )}

            {/* Levels 1 to 5 */}
            {!isTrain &&
              [1, 2, 3, 4, 5].map((lvl) => {
                const isCurrent = currentLevel === lvl;
                const rentVal = rentLevels[lvl] || 0;
                const isHotel = lvl === 5;

                return (
                  <div
                    key={lvl}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '5px 10px',
                      fontSize: '12px',
                      backgroundColor: isCurrent ? 'rgba(76, 175, 80, 0.15)' : '#FFF',
                      borderBottom: lvl === 5 ? 'none' : '1px solid #F0F0F0',
                      fontWeight: isCurrent ? '800' : '600',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img
                        src={LEVEL_ICONS[lvl]}
                        alt={`Lvl ${lvl}`}
                        style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                      />
                      <span style={{ color: '#333' }}>
                        {isHotel ? 'Hotel' : `${lvl} House${lvl > 1 ? 's' : ''}`}
                      </span>
                      {isHotel ? (
                        <img src={hotelImg} alt="Hotel" style={{ height: '14px', marginLeft: '2px' }} />
                      ) : (
                        <img src={houseImg} alt="House" style={{ height: '12px', marginLeft: '2px' }} />
                      )}
                    </div>
                    <span style={{ color: isCurrent ? '#2E7D32' : '#222' }}>
                      ${rentVal.toLocaleString()}
                    </span>
                  </div>
                );
              })}

            {/* Train Levels */}
            {isTrain &&
              [1, 2, 3, 4].map((count) => {
                const rentVal = rentLevels[count - 1] || 0;
                return (
                  <div
                    key={count}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 10px',
                      fontSize: '12px',
                      borderBottom: count === 4 ? 'none' : '1px solid #F0F0F0',
                      fontWeight: '600',
                    }}
                  >
                    <span style={{ color: '#444' }}>If {count} Railroad{count > 1 ? 's' : ''} Owned</span>
                    <span style={{ color: '#222' }}>${rentVal.toLocaleString()}</span>
                  </div>
                );
              })}
          </div>

          {/* Building & Mortgage Costs */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '8px 10px',
              backgroundColor: '#FAFAFA',
              borderRadius: '8px',
              marginBottom: '14px',
            }}
          >
            {!isTrain && property.upgradeCost && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>House Cost:</span>
                <strong style={{ color: '#333' }}>${property.upgradeCost.toLocaleString()}</strong>
              </div>
            )}
            {!isTrain && property.upgradeCost && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Hotel Cost:</span>
                <strong style={{ color: '#333' }}>${(property.upgradeCost * 2).toLocaleString()}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Mortgage Value:</span>
              <strong style={{ color: '#333' }}>${mortgageValue.toLocaleString()}</strong>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={onClose}
              style={{
                backgroundImage: `url(${btnBlue})`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#FFF',
                fontWeight: '900',
                fontSize: '13px',
                padding: '10px 42px',
                letterSpacing: '1px',
                cursor: 'pointer',
                filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.25))',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
