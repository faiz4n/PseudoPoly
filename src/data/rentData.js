// Rent Data mapped to Board Tile Indices
// User IDs are preserved for reference

// Rent Data mapped to Board Tile Indices
// User IDs are preserved for reference

export const RENT_DATA = {
  // --- Bottom Row ---
  // Group 1: Yellow (3 Properties)
  1: { // Shop
    id: 1,
    name: "Shop",
    groupId: 1,
    price: 400,
    baseRent: 40,
    upgradeCost: 200,
    rentLevels: [40, 160, 600, 1400, 1720, 2000]
  },
  2: { // Super market
    id: 2,
    name: "Super market",
    groupId: 1,
    price: 500,
    baseRent: 50,
    upgradeCost: 250,
    rentLevels: [50, 200, 750, 1750, 2150, 2500]
  },
  5: { // Service station
    id: 3,
    name: "Service station",
    groupId: 1,
    price: 600,
    baseRent: 60,
    upgradeCost: 300,
    rentLevels: [60, 240, 900, 2100, 2580, 3000]
  },

  // Group 2: Red (3 Properties)
  6: { // Swim. pool
    id: 4,
    name: "Swim. pool",
    groupId: 2,
    price: 700,
    baseRent: 70,
    upgradeCost: 350,
    rentLevels: [70, 280, 1050, 2450, 3010, 3500]
  },
  8: { // Zoo
    id: 5,
    name: "Zoo",
    groupId: 2,
    price: 800,
    baseRent: 80,
    upgradeCost: 400,
    rentLevels: [80, 320, 1200, 2800, 3440, 4000]
  },
  9: { // Ice-rink
    id: 6,
    name: "Ice-rink",
    groupId: 2,
    price: 900,
    baseRent: 90,
    upgradeCost: 450,
    rentLevels: [90, 360, 1350, 3150, 3870, 4500]
  },

  // --- Left Column ---
  // Group 3: Pink (3 Properties)
  // --- Left Column ---
  // Group 3: Pink (3 Properties)
  11: { // Pizzeria
    id: 7,
    name: "Pizzeria",
    groupId: 3,
    price: 1000,
    baseRent: 100,
    upgradeCost: 500,
    rentLevels: [100, 400, 1500, 3500, 4300, 5000]
  },
  12: { // Cinema
    id: 8,
    name: "Cinema",
    groupId: 3,
    price: 1100,
    baseRent: 110,
    upgradeCost: 550,
    rentLevels: [110, 440, 1650, 3850, 4730, 5500]
  },
  14: { // Night club
    id: 9,
    name: "Night club",
    groupId: 3,
    price: 1200,
    baseRent: 120,
    upgradeCost: 600,
    rentLevels: [120, 480, 1800, 4200, 5160, 6000]
  },

  // Group 4: Dark Orange (3 Properties - including Harbor)
  15: { // Airport
    id: 10,
    name: "Airport",
    groupId: 4,
    price: 1300,
    baseRent: 130,
    upgradeCost: 650,
    rentLevels: [130, 520, 1950, 4550, 5590, 6500]
  },
  16: { // Car salon
    id: 11,
    name: "Car salon",
    groupId: 4,
    price: 1400,
    baseRent: 140,
    upgradeCost: 700,
    rentLevels: [140, 560, 2100, 4900, 6020, 7000]
  },
  17: { // Harbor
    id: 12,
    name: "Harbor",
    groupId: 4,
    price: 1500,
    baseRent: 150,
    upgradeCost: 750,
    rentLevels: [150, 600, 2250, 5250, 6450, 7500]
  },

  // --- Top Row ---
  // Group 5: Light Green (3 Properties)
  19: { // News paper
    id: 13,
    name: "News paper",
    groupId: 5,
    price: 1600,
    baseRent: 160,
    upgradeCost: 800,
    rentLevels: [160, 640, 2400, 5600, 6880, 8000]
  },
  20: { // TV channel
    id: 14,
    name: "TV channel",
    groupId: 5,
    price: 1700,
    baseRent: 170,
    upgradeCost: 850,
    rentLevels: [170, 680, 2550, 5950, 7310, 8500]
  },
  22: { // Mobile op.
    id: 15,
    name: "Mobile op.",
    groupId: 5,
    price: 1800,
    baseRent: 180,
    upgradeCost: 900,
    rentLevels: [180, 720, 2700, 6300, 7740, 9000]
  },

  // Group 6: Purple (3 Properties)
  24: { // Toy factory
    id: 16,
    name: "Toy factory",
    groupId: 6,
    price: 1900,
    baseRent: 190,
    upgradeCost: 950,
    rentLevels: [190, 760, 2850, 6650, 8170, 9500]
  },
  25: { // Candy factory
    id: 17,
    name: "Candy factory",
    groupId: 6,
    price: 2000,
    baseRent: 200,
    upgradeCost: 1000,
    rentLevels: [200, 800, 3000, 7000, 8600, 10000]
  },
  27: { // Organic farm
    id: 18,
    name: "Organic farm",
    groupId: 6,
    price: 2100,
    baseRent: 210,
    upgradeCost: 1050,
    rentLevels: [210, 840, 3150, 7350, 9030, 10500]
  },

  // --- Right Column ---
  // Group 7: Dark Green (2 Properties)
  29: { // Oil well
    id: 19,
    name: "Oil well",
    groupId: 7,
    price: 2200,
    baseRent: 220,
    upgradeCost: 1100,
    rentLevels: [220, 880, 3300, 7700, 9460, 11000]
  },
  30: { // Diamond mine
    id: 20,
    name: "Diamond mine",
    groupId: 7,
    price: 2300,
    baseRent: 230,
    upgradeCost: 1150,
    rentLevels: [230, 920, 3450, 8050, 9890, 11500]
  },

  // Group 8: Lime Green (2 Properties)
  34: { // Hollywood
    id: 21,
    name: "Hollywood",
    groupId: 8,
    price: 2400,
    baseRent: 240,
    upgradeCost: 1200,
    rentLevels: [240, 960, 3600, 8400, 10320, 12000]
  },
  35: { // Electronics factory
    id: 22,
    name: "Electronics factory",
    groupId: 8,
    price: 2500,
    baseRent: 250,
    upgradeCost: 1250,
    rentLevels: [250, 1000, 3750, 8750, 10750, 12500]
  }
};

export const TRAIN_RENT = [125, 250, 500, 1000];
export const TRAIN_TILES = [4, 13, 21, 32]; // Updated indices: 4, 13, 21, 32
