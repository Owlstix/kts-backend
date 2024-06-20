const admin = require("firebase-admin");
const {
  generateRandomValueFromProbabilities,
  generateRandomGender,
} = require("../utils/utils");
const {TIER, HERO_TYPE, TIER_PROPERTIES, GENDER} = require("../types/types");
const Hero = require("../types/hero");
const askGemini = require("../aiProviders/askGemini");
const {geminiSystemInstruction, heroGeneratePrompt} = require("../constants/prompts");

const db = admin.firestore();

const generateHero = async (req, res) => {
  try {
    const {userId} = req.body;

    if (!userId) {
      res.status(400).send({error: "userId is required"});
      return;
    }

    // Verify that the user exists
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).send({error: "user not found"});
      return;
    }

    // Randomly generate hero attributes
    const gender = generateRandomGender();
    const tier = generateRandomValueFromProbabilities(
        Object.values(TIER),
        Object.values(TIER_PROPERTIES).map((t) => t.rarity),
    );

    const typeKeys = Object.keys(HERO_TYPE);
    const equalProbability = 1 / typeKeys.length;
    const equalProbabilities = new Array(typeKeys.length).fill(equalProbability);

    const type = generateRandomValueFromProbabilities(
        Object.values(HERO_TYPE),
        equalProbabilities,
    );

    // Prepare the prompt for generating name and bio
    const prompt = heroGeneratePrompt(Object.keys(GENDER)[gender].toLowerCase(),
        Object.keys(HERO_TYPE)[type].toLowerCase());

    // Call the askGemini function with the system instruction and generated prompt
    const heroData = await askGemini(geminiSystemInstruction, prompt);

    const {name, bio} = heroData;

    // Create hero using Hero class
    const hero = Hero.create(gender, tier, type, name, bio);

    // Add additional properties to hero object (excluding currentHp)
    const heroWithTimestamp = {
      gender: hero.gender,
      tier: hero.tier,
      type: hero.type,
      maxHp: hero.maxHp,
      attack: hero.attack,
      name: hero.name,
      bio: hero.bio,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Store the hero in Firestore
    const heroRef = await db.collection("heroes").add(heroWithTimestamp);

    // Create the userToHero relationship
    const userToHero = {
      heroId: heroRef.id,
      userId: userId,
      currentHp: hero.currentHp,
    };

    // Store the relationship in Firestore
    await db.collection("userToHero").add(userToHero);

    // Assign the hero ID to the response object
    hero.id = heroRef.id;

    // Send the response back to the client
    res.status(200).send({hero});
  } catch (error) {
    console.error("Error generating hero:", error);
    res.status(500).send({error: "Error generating hero", details: error.message});
  }
};

module.exports = {generateHero};
