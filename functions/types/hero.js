const {
  generateRandomValueInRange,
} = require("../utils/utils");

const {
  TIER_PROPERTIES,
  HERO_TYPE_PROPERTIES,
} = require("./types");

/**
   * Class representing a Hero.
   */
class Hero {
  /**
     * Create a hero.
     * @param {string} id - The id of the hero doc.
     * @param {number} gender - The gender of the hero.
     * @param {number} tier - The tier of the hero.
     * @param {number} type - The type of the hero.
     * @param {number} maxHp - The maximum HP of the hero.
     * @param {number} currentHp - The current HP of the hero.
     * @param {number} attack - The attack value of the hero.
     * @param {string} name - The name of the hero.
     * @param {string} bio - The biography of the hero.
     */
  constructor(id, gender, tier, type, maxHp, currentHp, attack, name, bio) {
    this.id = id;
    this.gender = gender;
    this.tier = tier;
    this.type = type;
    this.maxHp = maxHp;
    this.currentHp = currentHp;
    this.attack = attack;
    this.name = name;
    this.bio = bio;
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
  static create(gender, tier, type, name, bio) {
    const tierProps = TIER_PROPERTIES[tier];
    const typeProps = HERO_TYPE_PROPERTIES[type];

    const maxHp = generateRandomValueInRange(typeProps.hp.min, typeProps.hp.max) * tierProps.multiplier;
    const currentHp = maxHp; // Initialize current HP to max HP
    const attack = generateRandomValueInRange(typeProps.attack.min, typeProps.attack.max) * tierProps.multiplier;

    return new Hero(null, gender, tier, type, maxHp, currentHp, attack, name, bio);
  }
}

module.exports = Hero;
