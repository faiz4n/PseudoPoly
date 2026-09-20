import React from "react";
import mortgageStamp from "../assets/upgrades/mortgage_stamp.png";

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

  const price = property.price || 0;
  const baseRent = property.baseRent || Math.round(price * 0.1);
  const rentLevels = property.rentLevels || [
    baseRent,
    baseRent * 4,
    baseRent * 12,
    baseRent * 28,
    baseRent * 34,
    baseRent * 40,
  ];
  const monopolyRent = rentLevels[0] * 2 || baseRent * 2;
  const upgradeCost = property.upgradeCost || Math.round(price / 2);
  const isTrain = !!property.isTrain;

  return (
    <div
      className={`modal-overlay ref-modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ref-golden-card ref-property-info-card">
        {/* Blue Glossy Header Banner */}
        <div className="ref-prop-header">
          <span className="ref-prop-title">{property.name}</span>
          <button
            className="ref-help-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ?
          </button>
        </div>

        {/* Cost vs Rent Top Row */}
        <div className="ref-prop-cost-rent-row">
          <div className="ref-prop-col left">
            <span className="ref-prop-label">Cost</span>
            <span className="ref-prop-val">{price.toLocaleString()}</span>
          </div>
          <div className="ref-prop-divider" />
          <div className="ref-prop-col right">
            <span className="ref-prop-label">Rent</span>
            <span className="ref-prop-val">{baseRent.toLocaleString()}</span>
          </div>
        </div>

        {/* Purple CHAIN | LEVELS Ribbon */}
        <div className="ref-purple-ribbon">
          <span>{isTrain ? "TRAINS" : "CHAIN"}</span>
          <span>LEVELS</span>
        </div>

        {/* 6 Tiers Table */}
        <div className="ref-prop-table">
          <div className="ref-prop-divider-full" />

          {/* Row 0: Monopoly / Chain bonus */}
          <div className="ref-prop-table-row">
            <div className="ref-prop-cell left">
              {isTrain ? "1 Train" : "0"}
            </div>
            <div className="ref-prop-cell right">
              <span>{(isTrain ? rentLevels[0] : monopolyRent).toLocaleString()}</span>
            </div>
          </div>

          {/* Row 1: 1 House */}
          <div className="ref-prop-table-row">
            <div className="ref-prop-cell left">
              {isTrain ? "2 Trains" : upgradeCost.toLocaleString()}
            </div>
            <div className="ref-prop-cell right">
              <span>{(rentLevels[1] || baseRent * 4).toLocaleString()}</span>
              {!isTrain && (
                <svg width="14" height="14" viewBox="0 0 24 24" className="ref-house-icon">
                  <path d="M12 3L2 12h3v8h14v-8h3L12 3z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.5" />
                  <rect x="10" y="13" width="4" height="7" fill="#81c784" />
                </svg>
              )}
            </div>
          </div>

          {/* Row 2: 2 Houses */}
          <div className="ref-prop-table-row">
            <div className="ref-prop-cell left">
              {isTrain ? "3 Trains" : upgradeCost.toLocaleString()}
            </div>
            <div className="ref-prop-cell right">
              <span>{(rentLevels[2] || baseRent * 12).toLocaleString()}</span>
              {!isTrain && (
                <div className="ref-houses-wrap">
                  {[1, 2].map((h) => (
                    <svg key={h} width="14" height="14" viewBox="0 0 24 24" className="ref-house-icon">
                      <path d="M12 3L2 12h3v8h14v-8h3L12 3z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.5" />
                      <rect x="10" y="13" width="4" height="7" fill="#81c784" />
                    </svg>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 3: 3 Houses */}
          <div className="ref-prop-table-row">
            <div className="ref-prop-cell left">
              {isTrain ? "4 Trains" : upgradeCost.toLocaleString()}
            </div>
            <div className="ref-prop-cell right">
              <span>{(rentLevels[3] || baseRent * 28).toLocaleString()}</span>
              {!isTrain && (
                <div className="ref-houses-wrap">
                  {[1, 2, 3].map((h) => (
                    <svg key={h} width="14" height="14" viewBox="0 0 24 24" className="ref-house-icon">
                      <path d="M12 3L2 12h3v8h14v-8h3L12 3z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.5" />
                      <rect x="10" y="13" width="4" height="7" fill="#81c784" />
                    </svg>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: 4 Houses */}
          <div className="ref-prop-table-row">
            <div className="ref-prop-cell left">
              {isTrain ? "-" : upgradeCost.toLocaleString()}
            </div>
            <div className="ref-prop-cell right">
              <span>{(rentLevels[4] || baseRent * 34).toLocaleString()}</span>
              {!isTrain && (
                <div className="ref-houses-wrap">
                  {[1, 2, 3, 4].map((h) => (
                    <svg key={h} width="14" height="14" viewBox="0 0 24 24" className="ref-house-icon">
                      <path d="M12 3L2 12h3v8h14v-8h3L12 3z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.5" />
                      <rect x="10" y="13" width="4" height="7" fill="#81c784" />
                    </svg>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Hotel */}
          <div className="ref-prop-table-row">
            <div className="ref-prop-cell left">
              {isTrain ? "-" : (upgradeCost * 2).toLocaleString()}
            </div>
            <div className="ref-prop-cell right">
              <span>{(rentLevels[5] || baseRent * 40).toLocaleString()}</span>
              {!isTrain && (
                <svg width="22" height="14" viewBox="0 0 32 24" className="ref-hotel-icon">
                  <path d="M2 9L16 2l14 7v13H2V9z" fill="#c62828" stroke="#8e0000" strokeWidth="1.5" />
                  <rect x="6" y="11" width="4" height="4" fill="#ffcdd2" />
                  <rect x="14" y="11" width="4" height="4" fill="#ffcdd2" />
                  <rect x="22" y="11" width="4" height="4" fill="#ffcdd2" />
                  <rect x="13" y="17" width="6" height="5" fill="#ef9a9a" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* OK Exit Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          <button
            className="ref-pill-btn ref-pill-blue"
            style={{ minWidth: '110px', height: '36px', fontSize: '15px' }}
            onClick={onClose}
          >
            OK
          </button>
        </div>

        {/* Mortgaged Stamp Overlay if applicable */}
        {isMortgaged && (
          <img
            src={mortgageStamp}
            alt="MORTGAGED"
            className="ref-mortgage-stamp-overlay"
          />
        )}
      </div>
    </div>
  );
}
