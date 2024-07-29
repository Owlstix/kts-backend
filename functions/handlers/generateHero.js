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

// Function to get a random chibi ID based on tier, gender, and type
const getRandomChibiDoc = async (tier, gender, type) => {
  console.log(`Looking for chibis with tier: ${tier}, gender: ${gender}, type: ${type}`);

  const chibisRef = db.collection("chibis");
  const querySnapshot = await chibisRef
      .where("tier", "==", tier)
      .where("gender", "==", gender)
      .where("type", "==", type)
      .get();

  if (querySnapshot.empty) {
    console.log("No matching chibis found.");
    throw new Error("No matching chibis found.");
  }

  const randomIndex = Math.floor(Math.random() * querySnapshot.size);
  return querySnapshot.docs[randomIndex];
};

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
    const genderIndex = generateRandomGender();
    const tierIndex = generateRandomValueFromProbabilities(
        Object.values(TIER),
        Object.values(TIER_PROPERTIES).map((t) => t.rarity),
    );

    const typeKeys = Object.keys(HERO_TYPE);
    const equalProbability = 1 / typeKeys.length;
    const equalProbabilities = new Array(typeKeys.length).fill(equalProbability);

    const typeIndex = generateRandomValueFromProbabilities(
        Object.values(HERO_TYPE),
        equalProbabilities,
    );

    const gender = Object.keys(GENDER)[genderIndex];
    const tier = Object.keys(TIER)[tierIndex];
    const type = Object.keys(HERO_TYPE)[typeIndex];

    console.log(`Generated attributes - Gender: ${gender}, Tier: ${tier}, Type: ${type}`);

    // Get a random chibi document based on the generated hero attributes
    const chibiDoc = await getRandomChibiDoc(tier.toLowerCase(), gender.toLowerCase(), type.toLowerCase());
    const chibiId = chibiDoc.id;
    const chibiDesc = chibiDoc.data().desc;
    const chibiAvatar = chibiDoc.data().styledAvatarUrl;

    console.log(`Selected Chibi - ID: ${chibiId}, Desc: ${chibiDesc}, Avatar: ${chibiAvatar}`);

    // Prepare the prompt for generating name and bio, including the chibi description
    const prompt = heroGeneratePrompt(
        gender.toLowerCase(),
        type.toLowerCase(),
        chibiDesc, // Add the chibi description to the prompt
    );
    console.log(`Generated prompt: ${prompt}`);

    // Call the askGemini function with the system instruction and generated prompt
    const heroData = await askGemini(geminiSystemInstruction, prompt);

    const {name, bio} = heroData;

    // Create hero using Hero class
    const hero = Hero.create(genderIndex, tierIndex, typeIndex, name, bio, chibiId);

    // Add additional properties to hero object (excluding currentHp)
    const heroWithTimestamp = {
      gender: hero.gender,
      tier: hero.tier,
      type: hero.type,
      maxHp: hero.maxHp,
      attack: hero.attack,
      name: hero.name,
      bio: hero.bio,
      chibiId: hero.chibiId, // Assign the chibiId to the hero object
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
    hero.chibiId = chibiId;
    hero.chibiAvatar = chibiAvatar;

    // Send the response back to the client
    res.status(200).send({hero});
  } catch (error) {
    console.error("Error generating hero:", error);
    res.status(500).send({error: "Error generating hero", details: error.message});
  }
};

module.exports = {generateHero};
