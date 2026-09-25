import React from "react";
import "../App.css";

function BuyModal({
  property,
  hasDiscount = false,
  isClosing = false,
  onBuy,
  onCancel,
}) {
  if (!property) return null;

  const price = property.price || 0;
  const rent = property.rent !== undefined ? property.rent : Math.floor(price * 0.1);
  const displayPrice = hasDiscount ? Math.floor(price / 2) : price;

  return (
    <div
      className={`modal-overlay ref-modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-shell buy-modal-replica">
        {/* ---- Title bar ---- */}
        <div className="title-bar">
          <div className="title-text">BUYING</div>
          <div className="icon-group">
            <div
              className="icon-btn help"
              onClick={(e) => e.stopPropagation()}
            >
              <span>?</span>
            </div>
            <div
              className="icon-btn close"
              onClick={onCancel}
            >
              <div className="x-mark"></div>
            </div>
          </div>
        </div>

        {/* ---- Body panel ---- */}
        <div className="body-panel">
          <div className="maroon ice-rink">{property.name}</div>

          <div className="cost-rent-wrap">
            <div className="row">
              <span className="maroon label">Cost</span>
              <span className="maroon value">
                {hasDiscount && (
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "#999",
                      marginRight: "6px",
                      fontSize: "0.85em",
                    }}
                  >
                    {price.toLocaleString()}
                  </span>
                )}
                {displayPrice.toLocaleString()}
              </span>
            </div>
            <div className="row">
              <span className="maroon label">Rent</span>
              <span className="maroon value">{rent.toLocaleString()}</span>
            </div>
          </div>

          <div className="buttons-row">
            <div className="action-btn btn-cancel" onClick={onCancel}>
              CANCEL
            </div>
            <div className="action-btn btn-buy" onClick={onBuy}>
              BUY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(BuyModal);
