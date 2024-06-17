
/**
 * Class representing a Hero.
 */
class Hero {
  /**
   * Create a hero.
   * @param {number} gender - The gender of the hero.
   * @param {number} tier - The tier of the hero.
   * @param {number} type - The type of the hero.
   * @param {number} maxHp - The maximum HP of the hero.
   * @param {number} attack - The attack value of the hero.
   * @param {string} name - The name of the hero.
   * @param {string} bio - The biography of the hero.
   */
  constructor(gender, tier, type, maxHp, attack, name, bio) {
    this.gender = gender;
    this.tier = tier;
    this.type = type;
    this.maxHp = maxHp;
    this.attack = attack;
    this.name = name;
    this.bio = bio;
  }

  /**
   * Generate a random value between min and max.
   * @param {number} min - The minimum value.
   * @param {number} max - The maximum value.
   * @return {number} - A random value between min and max.
   */
  static generateRandomValueInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random value based on probabilities.
   * @param {Array} options - The array of options.
   * @param {Array} probabilities - The array of probabilities.
   * @return {any} - A random value from the options based on probabilities.
   */
  static generateRandomValueFromProbabilities(options, probabilities) {
    const random = Math.random(); // Generate a random number between 0 and 1
    let sum = 0;

    for (let i = 0; i < options.length; i++) {
      sum += probabilities[i];
      if (random <= sum) {
        return options[i];
      }
    }
    return options[options.length - 1]; // Return the last option if no other match
  }

  /**
   * Generate a random gender with 50% probability for male and female.
   * @return {number} - A random gender.
   */
  static generateRandomGender() {
    return Hero.generateRandomValueFromProbabilities([GENDER.MALE, GENDER.FEMALE], [0.5, 0.5]);
  }

  /**
   * Create a new hero with specified properties.
   * @param {number} gender - The gender of the hero.
   * @param {number} tier - The tier of the hero.
   * @param {number} type - The type of the hero.
   * @param {string} name - The name of the hero.
   * @param {string} bio - The biography of the hero.
   * @return {Hero} - The newly created hero.
   */
  static createHero(gender, tier, type, name, bio) {
    const tierProps = TIER_PROPERTIES[tier];
    const typeProps = TYPE_PROPERTIES[type];

    const maxHp = Hero.generateRandomValueInRange(typeProps.hp.min, typeProps.hp.max) * tierProps.multiplier;
    const attack = Hero.generateRandomValueInRange(typeProps.attack.min, typeProps.attack.max) * tierProps.multiplier;

    return new Hero(gender, tier, type, maxHp, attack, name, bio);
  }
}

const TIER = {
  S: 0,
  A: 1,
  B: 2,
};

const TYPE = {
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

const TYPE_PROPERTIES = {
  [TYPE.FIGHTER]: {
    hp: {min: 700, max: 1000},
    attack: {min: 30, max: 50},
  },
  [TYPE.ASSASSIN]: {
    hp: {min: 500, max: 700},
    attack: {min: 50, max: 70},
  },
  [TYPE.MAGE]: {
    hp: {min: 350, max: 500},
    attack: {min: 70, max: 100},
  },
};

module.exports = {
  TIER,
  TYPE,
  GENDER,
  TIER_PROPERTIES,
  TYPE_PROPERTIES,
  Hero,
};
