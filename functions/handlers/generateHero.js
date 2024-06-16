const admin = require("firebase-admin");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const functions = require("firebase-functions");
const {
  TIER_RARITY,
  TIER_MULTIPLIER,
  HP_RANGE,
  ATTACK_RANGE,
} = require("../utils/constants");

const db = admin.firestore();

const generateRandomValue = (options, probabilities) => {
  const random = Math.random();
  let sum = 0;
  for (let i = 0; i < options.length; i++) {
    sum += probabilities[i];
    if (random <= sum) {
      return options[i];
    }
  }
  return options[options.length - 1];
};

const generateHero = async (req, res) => {
  try {
    const userId = req.query.userId;

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
    const sex = Math.random() < 0.5 ? "male" : "female";
    const tier = generateRandomValue(["B-Tier", "A-Tier", "S-Tier"], TIER_RARITY);
    const type = generateRandomValue(["fighter", "killer", "mage"], [0.33, 0.33, 0.34]);

    const tierMultiplierValue = TIER_MULTIPLIER[tier];

    const maxHP = Math.floor(
        (Math.random() * (HP_RANGE[type].max - HP_RANGE[type].min + 1)) +
      HP_RANGE[type].min,
    ) * tierMultiplierValue;

    const attack = Math.floor(
        (Math.random() * (ATTACK_RANGE[type].max - ATTACK_RANGE[type].min + 1)) +
      ATTACK_RANGE[type].min,
    ) * tierMultiplierValue;

    // Access the API key from Firebase functions config
    const geminiApiKey = functions.config().gemini.api_key;

    // Initialize the GoogleGenerativeAI with the API key
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // Initialize the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
      },
    });

    // Prompt for generating name and bio
    const prompt = `
    Generate a name and bio for a 
    ${sex} 
    hero of class ${type} 
    set in a dark fantasy world. This is a cruel world where everyone tries to survive after a mysterious calamity. 
    The bio should be not exceeding 100 words. Use the following JSON schema:

    {
      "name": "string",
      "bio": "string"
    }
    `;

    // Generate content using the Gemini AI model
    const result = await model.generateContent(prompt);

    // Log the response for debugging purposes
    console.log("Complete response from Gemini API:", JSON.stringify(result));

    // Extract the relevant data from the response
    const candidates = result.response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates found in the response from Gemini API.");
    }

    // Extract text from the first candidate's content parts
    const contentParts = candidates[0].content.parts;
    if (!contentParts || contentParts.length === 0) {
      throw new Error("No content parts found in the candidate response.");
    }

    let responseText = contentParts.map((part) => part.text).join(" ");

    // Log the response text to see the exact format
    console.log("Extracted response text from Gemini API:", responseText);

    // Remove the backticks and parse the JSON response
    responseText = responseText.replace(/```json|```/g, "").trim();

    let heroData;
    try {
      heroData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      res.status(500).send({error: "Error parsing Gemini API response", details: jsonError.message});
      return;
    }

    const {name, bio} = heroData;

    // Create the hero object
    const hero = {
      sex,
      tier,
      type,
      maxHp: maxHP,
      attack,
      name,
      bio,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Store the hero in Firestore
    const heroRef = await db.collection("heroes").add(hero);

    // Create the userToHero relationship
    const userToHero = {
      heroId: heroRef.id,
      userId: userId,
      currentHp: maxHP,
    };

    // Store the relationship in Firestore
    const userToHeroRef = await db.collection("userToHero").add(userToHero);

    // Send the response back to the client
    res.status(200).send({heroId: heroRef.id, userToHeroId: userToHeroRef.id, ...hero});
  } catch (error) {
    console.error("Error generating hero:", error);
    res.status(500).send({error: "Error generating hero", details: error.message});
  }
};

module.exports = {generateHero};
