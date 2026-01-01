export const CHANCE_CARDS = [
  // POSITIVE
  {
    id: 1,
    text: "Bank pays you dividend of $50.",
    action: "MONEY_ADD",
    amount: 50
  },
  {
    id: 2,
    text: "You have won a crossword competition. Collect $100.",
    action: "MONEY_ADD",
    amount: 100
  },
  
  // NEGATIVE
  {
    id: 3,
    text: "Pay poor tax of $15.",
    action: "MONEY_SUBTRACT",
    amount: 15
  },
  {
    id: 4,
    text: "Speeding fine! Pay $20.",
    action: "MONEY_SUBTRACT",
    amount: 20
  },
  {
    id: 5,
    text: "Make general repairs on all your property. Pay $25 per house, $100 per hotel.",
    action: "REPAIRS",
    houseCost: 25,
    hotelCost: 100
  },

  // MOVEMENT
  {
    id: 6,
    text: "Advance to GO. Collect $1000.",
    action: "MOVE_TO",
    targetIndex: 0
  },
  {
    id: 7,
    text: "Go to Jail. Do not pass GO, do not collect $1000.",
    action: "GO_TO_JAIL",
    targetIndex: 28
  },
  {
    id: 8,
    text: "Teleport! Advance to a random space.",
    action: "MOVE_TO_RANDOM"
  },
  {
    id: 9,
    text: "Go Back Random Spaces (1-10).",
    action: "MOVE_BACKWARD_RANDOM"
  },
  {
    id: 10,
    text: "Take a ride! Move forward Random Spaces (1-10).",
    action: "MOVE_FORWARD_RANDOM"
  },
  {
    id: 11,
    text: "Drunk driver! Stumble back 2 spaces.",
    action: "MOVE_STEPS",
    steps: -2
  }
];
