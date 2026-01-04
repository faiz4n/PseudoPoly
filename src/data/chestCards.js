export const CHEST_CARDS = [
  {
    id: 1,
    text: "📈 Insider Trading! You receive $500 from the bank's secret profits.",
    action: "MONEY_ADD",
    amount: 500
  },
  {
    id: 2,
    text: "💸 Debt Forgiveness! The Bank wipes out your current debt.",
    action: "CLEAR_DEBT",
    debtType: "full"
  },
  {
    id: 3,
    text: "📉 50% Discount! Your next property purchase or upgrade is half price.",
    action: "ADD_EFFECT",
    type: "discount_50"
  },
  {
    id: 4,
    text: "🛡️ Audit Immunity! You are safe from the next Audit.",
    action: "ADD_INVENTORY",
    type: "audit_immunity"
  },
  {
    id: 5,
    text: "⏳ Debt Extension! The Bank gives you extra time to pay.",
    action: "EXTEND_DEBT"
  },
  {
    id: 6,
    text: "🏃 Get Out of Jail Free.",
    action: "ADD_INVENTORY",
    type: "jail_card"
  },
  // Duplicates to fill the deck
  {
    id: 7,
    text: "💸 Debt Forgiveness! The Bank wipes out your current debt.",
    action: "CLEAR_DEBT",
    debtType: "full"
  },
  {
    id: 8,
    text: "📉 50% Discount! Your next property purchase or upgrade is half price.",
    action: "ADD_EFFECT",
    type: "discount_50"
  }
];
