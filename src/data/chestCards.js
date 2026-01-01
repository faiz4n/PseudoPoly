export const CHEST_CARDS = [
  {
    id: 1,
    text: "🛡️ Robber Immunity! You are safe from the next robbery.",
    action: "ADD_INVENTORY",
    type: "robbery_immunity"
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
    text: "🚫 Tax Immunity! You do not have to pay Income Tax next time.",
    action: "ADD_INVENTORY",
    type: "tax_immunity"
  },
  {
    id: 5,
    text: "⏳ Debt Extension! The Bank gives you extra time to pay.",
    action: "EXTEND_DEBT" // Placeholder for debt system
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
