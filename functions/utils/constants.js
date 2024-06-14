const TIER_RARITY = [0.7, 0.25, 0.05];
const TIER_MULTIPLIER = {
  "B-Tier": 1,
  "A-Tier": 1.5,
  "S-Tier": 2,
};

const HP_RANGE = {
  "fighter": {min: 700, max: 1000},
  "killer": {min: 500, max: 700},
  "mage": {min: 350, max: 500},
};

const ATTACK_RANGE = {
  "fighter": {min: 30, max: 50},
  "killer": {min: 50, max: 70},
  "mage": {min: 70, max: 100},
};

module.exports = {
  TIER_RARITY,
  TIER_MULTIPLIER,
  HP_RANGE,
  ATTACK_RANGE,
};
