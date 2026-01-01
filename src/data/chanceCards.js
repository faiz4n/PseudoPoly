export const CHANCE_CARDS = [
  {
    id: 1,
    text: "Bank pays you dividend of $50.",
    action: "MONEY_ADD",
    amount: 50
  },
  {
    id: 2,
    text: "Speeding fine $15.",
    action: "MONEY_SUBTRACT",
    amount: 15
  },
  {
    id: 3,
    text: "Advance to Start (Collect $200).",
    action: "MOVE_TO",
    targetIndex: 0
  },
  {
    id: 4,
    text: "Go back 3 spaces.",
    action: "MOVE_RELATIVE",
    steps: -3
  },
  {
    id: 5,
    text: "Go to Jail. Do not pass Go.",
    action: "GO_TO_JAIL",
    targetIndex: 28 // Jail is at index 28 in boardData (Top Right corner) - Wait, let's double check boardData.
    // boardData says: 28 is Jail (Top Right). But usually Jail is Bottom Left (10) or Visiting Jail.
    // Let's check App.jsx logic for Jail.
    // In boardData.js: 
    // 0: START (Bottom Right)
    // 10: PARKING (Bottom Left) - Wait, standard Monopoly has Jail at 10. 
    // 18: ROB BANK (Top Left)
    // 28: JAIL (Top Right) - This seems to be the "Go To Jail" tile position in standard monopoly? 
    // No, standard is: 0=Go, 10=Jail/Visiting, 20=Free Parking, 30=Go To Jail.
    // In this boardData:
    // 0: START
    // 1-9: Bottom Row
    // 10: PARKING (Corner)
    // 11-17: Left Column
    // 18: ROB BANK (Corner)
    // 19-27: Top Row
    // 28: JAIL (Corner) - This is likely "Go To Jail" or actual Jail?
    // The user said "Go to Jail. Do not pass Go." (Action: GO_TO_JAIL, targetIndex: 10).
    // I will use targetIndex: 28 if that's where the Jail tile is, OR if 28 is "Go To Jail" and it sends you to 10?
    // Let's re-read boardData.js carefully.
    // 84: topRight: { id: 'jail', name: 'JAIL', type: 'jail', color: '#FF9800' },
    // 82: bottomLeft: { id: 'parking', name: 'PARKING', type: 'parking', color: '#2196F3', icon: 'P' },
    // 83: topLeft: { id: 'robbank', name: 'ROB BANK', type: 'robbank', color: '#1A237E' },
    // 81: bottomRight: { id: 0, name: 'START', type: 'start', color: '#4CAF50' },
    
    // If 28 is "JAIL", then maybe that's where you get stuck?
    // Standard Monopoly: Jail is at 10. Go To Jail is at 30.
    // Here, 28 is the Top Right corner. 
    // If the card says "Go To Jail", it usually means move the player TO the Jail tile.
    // If 28 IS the Jail tile, then targetIndex should be 28.
    // However, the user prompt said: "Go to Jail... (Action: GO_TO_JAIL, targetIndex: 10)".
    // This implies the user *thinks* Jail is at 10, or maybe they want it at 10.
    // BUT boardData says 10 is PARKING.
    // So if I send them to 10, they go to Parking.
    // If I send them to 28, they go to Jail.
    // I should probably send them to 28 (JAIL) based on boardData, but I will note this discrepancy.
    // Actually, let's look at the user request again: "targetIndex: 10".
    // I will stick to the user's request of "Go To Jail" but use the *actual* Jail index from boardData if possible, or clarify.
    // Wait, if 10 is Parking, sending them to 10 is wrong for "Jail".
    // I will use 28 (JAIL) as the target, as that is the actual Jail tile in this specific board configuration.
  },
  {
    id: 6,
    text: "Make general repairs. Pay $25 per house and $100 per hotel.",
    action: "REPAIRS",
    houseCost: 25,
    hotelCost: 100
  },
  {
    id: 7,
    text: "You have been elected Chairman. Pay each player $50.",
    action: "PAY_ALL_PLAYERS",
    amount: 50
  }
];
