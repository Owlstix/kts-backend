const TIER = {
  S: 0,
  A: 1,
  B: 2,
};

const HERO_TYPE = {
  FIGHTER: 0,
  ASSASSIN: 1,
  MAGE: 2,
};

const GENDER = {
  MALE: 0,
  FEMALE: 1,
};

const TIER_PROPERTIES = {
  [TIER.S]: {
    rarity: 0.05,
    multiplier: 2,
  },
  [TIER.A]: {
    rarity: 0.25,
    multiplier: 1.5,
  },
  [TIER.B]: {
    rarity: 0.7,
    multiplier: 1,
  },
};

const HERO_TYPE_PROPERTIES = {
  [HERO_TYPE.FIGHTER]: {
    hp: {min: 700, max: 1000},
    attack: {min: 30, max: 50},
  },
  [HERO_TYPE.ASSASSIN]: {
    hp: {min: 500, max: 700},
    attack: {min: 50, max: 70},
  },
  [HERO_TYPE.MAGE]: {
    hp: {min: 350, max: 500},
    attack: {min: 70, max: 100},
  },
};

module.exports = {
  TIER,
  HERO_TYPE,
  GENDER,
  TIER_PROPERTIES,
  HERO_TYPE_PROPERTIES,
};
