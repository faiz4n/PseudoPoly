import React from "react";
import mortgageStamp from "../assets/upgrades/mortgage_stamp.png";

// Compact SVG House Icon
const HouseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path d="M12 3L2 12h3v8h14v-8h3L12 3z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.5" />
    <rect x="10" y="13" width="4" height="7" fill="#81c784" />
  </svg>
);

// Compact SVG Hotel Icon
const HotelIcon = () => (
  <svg width="15" height="10" viewBox="0 0 32 24" style={{ flexShrink: 0 }}>
    <path d="M2 9L16 2l14 7v13H2V9z" fill="#c62828" stroke="#8e0000" strokeWidth="1.5" />
    <rect x="6" y="11" width="4" height="4" fill="#ffcdd2" />
    <rect x="14" y="11" width="4" height="4" fill="#ffcdd2" />
    <rect x="22" y="11" width="4" height="4" fill="#ffcdd2" />
    <rect x="13" y="17" width="6" height="5" fill="#ef9a9a" />
  </svg>
);

function PropertyInfoModal({
  property,
  currentLevel = 0,
  owner = null,
  ownerName = null,
  ownerColor = null,
  isMortgaged = false,
  isMyProperty = false,
  canMortgage = false,
  canRedeem = false,
  mortgageValue = 0,
  redeemCost = 0,
  onMortgage = null,
  onRedeem = null,
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
      <div className="baloo-modal-shell info-mode">
        {/* ── Title Bar ── */}
        <div className="baloo-title-bar">
          <span className="baloo-title-text">{property.name}</span>
          <div className="baloo-title-right">
            <button
              className="baloo-help-btn"
              onClick={(e) => { e.stopPropagation(); }}
              aria-label="Help"
            >
              ?
            </button>
            <button
              className="baloo-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <div className="baloo-x-mark" />
            </button>
          </div>
        </div>

        {/* ── Tile Info Body (Pixel Replica of media_1789886064226.png) ── */}
        <div className="baloo-body baloo-info-body">
          {/* Cost & Rent Top Row with Center Vertical Divider */}
          <div className="baloo-info-top-row">
            <div className="baloo-info-half">
              <span className="baloo-cr-label">Cost</span>
              <span className="baloo-cr-val">{price.toLocaleString()}</span>
            </div>
            <div className="baloo-vertical-divider" />
            <div className="baloo-info-half">
              <span className="baloo-cr-label">Rent</span>
              <span className="baloo-cr-val">{baseRent.toLocaleString()}</span>
            </div>
          </div>

          {/* Purple CHAIN | LEVELS Ribbon */}
          <div className="baloo-purple-ribbon">
            <span>{isTrain ? "TRAINS" : "CHAIN"}</span>
            <span>LEVELS</span>
          </div>

          {/* 6-Tier Levels Table with Continuing Vertical Divider */}
          <div className="baloo-levels-table">
            <div className="baloo-vertical-divider" />

            {/* Row 0: Monopoly / 1 Train */}
            <div className={`baloo-table-row ${currentLevel === 0 ? "active" : ""}`}>
              <div className="baloo-cell-left">
                {isTrain ? "1 Train" : "0"}
              </div>
              <div className="baloo-cell-right">
                <span>{(isTrain ? rentLevels[0] : monopolyRent).toLocaleString()}</span>
              </div>
            </div>

            {/* Row 1: 1 House / 2 Trains */}
            <div className={`baloo-table-row ${currentLevel === 1 ? "active" : ""}`}>
              <div className="baloo-cell-left">
                {isTrain ? "2 Trains" : upgradeCost.toLocaleString()}
              </div>
              <div className="baloo-cell-right">
                <span>{(rentLevels[1] || baseRent * 4).toLocaleString()}</span>
                {!isTrain && <HouseIcon />}
              </div>
            </div>

            {/* Row 2: 2 Houses / 3 Trains */}
            <div className={`baloo-table-row ${currentLevel === 2 ? "active" : ""}`}>
              <div className="baloo-cell-left">
                {isTrain ? "3 Trains" : upgradeCost.toLocaleString()}
              </div>
              <div className="baloo-cell-right">
                <span>{(rentLevels[2] || baseRent * 12).toLocaleString()}</span>
                {!isTrain && (
                  <div className="baloo-houses-group">
                    <HouseIcon /><HouseIcon />
                  </div>
                )}
              </div>
            </div>

            {/* Row 3: 3 Houses / 4 Trains */}
            <div className={`baloo-table-row ${currentLevel === 3 ? "active" : ""}`}>
              <div className="baloo-cell-left">
                {isTrain ? "4 Trains" : upgradeCost.toLocaleString()}
              </div>
              <div className="baloo-cell-right">
                <span>{(rentLevels[3] || baseRent * 28).toLocaleString()}</span>
                {!isTrain && (
                  <div className="baloo-houses-group">
                    <HouseIcon /><HouseIcon /><HouseIcon />
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: 4 Houses */}
            <div className={`baloo-table-row ${currentLevel === 4 ? "active" : ""}`}>
              <div className="baloo-cell-left">
                {isTrain ? "-" : upgradeCost.toLocaleString()}
              </div>
              <div className="baloo-cell-right">
                <span>{(rentLevels[4] || baseRent * 34).toLocaleString()}</span>
                {!isTrain && (
                  <div className="baloo-houses-group">
                    <HouseIcon /><HouseIcon /><HouseIcon /><HouseIcon />
                  </div>
                )}
              </div>
            </div>

            {/* Row 5: Hotel */}
            <div className={`baloo-table-row ${currentLevel === 5 ? "active" : ""}`}>
              <div className="baloo-cell-left">
                {isTrain ? "-" : (upgradeCost * 2).toLocaleString()}
              </div>
              <div className="baloo-cell-right">
                <span>{(rentLevels[5] || baseRent * 40).toLocaleString()}</span>
                {!isTrain && <HotelIcon />}
              </div>
            </div>
          </div>

          {/* Compact Actions Footer */}
          <div className="baloo-info-footer" style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center" }}>
            {isMyProperty && (
              isMortgaged ? (
                <button
                  className="baloo-action-btn baloo-redeem-btn"
                  onClick={onRedeem}
                  disabled={!canRedeem}
                  title={!canRedeem ? "Not enough money to redeem" : "Redeem property"}
                >
                  Redeem (-${redeemCost.toLocaleString()})
                </button>
              ) : (
                <button
                  className="baloo-action-btn baloo-mortgage-btn"
                  onClick={onMortgage}
                  disabled={!canMortgage}
                  title={!canMortgage ? "Must sell all houses in group first" : "Mortgage property"}
                >
                  Mortgage (+${mortgageValue.toLocaleString()})
                </button>
              )
            )}
            <button className="baloo-ok-btn" onClick={onClose}>
              OK
            </button>
          </div>
          {isMyProperty && !isMortgaged && !canMortgage && (
            <div style={{ textAlign: "center", fontSize: "8.5px", color: "#c62828", fontWeight: 700, marginTop: "2px" }}>
              Sell all houses in color group before mortgaging
            </div>
          )}
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

export default React.memo(PropertyInfoModal);
