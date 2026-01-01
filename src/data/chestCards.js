export const CHEST_CARDS = [
  {
    id: 1,
    text: "Bank error in your favor. Collect $200.",
    action: "MONEY_ADD",
    amount: 200
  },
  {
    id: 2,
    text: "Pay Hospital Fees of $100.",
    action: "MONEY_SUBTRACT",
    amount: 100
  },
  {
    id: 3,
    text: "Grand Opera Night. Collect $50 from every player.",
    action: "COLLECT_FROM_ALL",
    amount: 50
  },
  {
    id: 4,
    text: "Get Out of Jail Free.",
    action: "ADD_INVENTORY",
    type: "jail_card"
  },
  {
    id: 5,
    text: "You are assessed for street repairs. Pay $40 per house, $115 per hotel.",
    action: "REPAIRS",
    houseCost: 40,
    hotelCost: 115
  },
  {
    id: 6,
    text: "Go to Jail.",
    action: "GO_TO_JAIL",
    targetIndex: 28 // Using 28 as Jail based on previous context
  },
  // CrazyPoly Unique Cards
  {
    id: 7,
    text: "All thieves are caught once! You are safe from the next robbery.",
    action: "ADD_INVENTORY",
    type: "robbery_immunity"
  },
  {
    id: 8,
    text: "Income Tax Refund! You are free from the next tax payment.",
    action: "ADD_INVENTORY",
    type: "tax_immunity"
  },
  {
    id: 9,
    text: "Your properties are booming! The Bank clears your current debt.",
    action: "CLEAR_DEBT",
    debtType: "full"
  },
  {
    id: 10,
    text: "Bank Subsidy! 30% of your debt is forgiven.",
    action: "CLEAR_DEBT",
    debtType: "percentage",
    value: 0.30
  }
];
