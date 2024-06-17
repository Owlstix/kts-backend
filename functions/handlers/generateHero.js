const admin = require("firebase-admin");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const functions = require("firebase-functions");
const {
  TIER,
  HERO_TYPE,
  TIER_PROPERTIES,
  GENDER,
  Hero,
} = require("../utils/constants");

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
    const gender = Hero.generateRandomGender();
    const tier =
       Hero.generateRandomValueFromProbabilities(Object.values(TIER),
           Object.values(TIER_PROPERTIES).map((t) => t.rarity));

    // Here we are understanding how many classess dowe have to identify probability dynamically
    const typeKeys = Object.keys(HERO_TYPE);
    const equalProbability = 1 / typeKeys.length;
    const equalProbabilities = new Array(typeKeys.length).fill(equalProbability);

    const type = Hero.generateRandomValueFromProbabilities(
        Object.values(HERO_TYPE),
        equalProbabilities,
    );

    // Access the API key from Firebase functions config
    const geminiApiKey = functions.config().gemini.api_key;

    // Initialize the GoogleGenerativeAI with the API key
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // Initialize the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `
        You are narrator in a text-based game that takes place in a dark fantasy setting. 
        Game will be spinning around village with surviving heroes in this cruel world. 
        You will be asked to narrate events for the village and heroes, generate interesting,
        mysterious biographies for heroes. 
        You should be fair narrator, sometimes cruel, sometimes kind, but always interesting.
      `,
      generationConfig: {
        temperature: 1,
        top_p: 0.9,
        top_k: 40,
      },
    });

    // Prompt for generating name and bio
    const prompt = `
    Generate a name and bio for a 
    ${Object.keys(GENDER)[gender].toLowerCase()} 
    hero of class ${Object.keys(HERO_TYPE)[type].toLowerCase()} 
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

    // Create hero using Hero class
    const hero = Hero.create(gender, tier, type, name, bio);

    // Add additional properties to hero object
    const heroWithTimestamp = {
      ...hero,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Store the hero in Firestore
    const heroRef = await db.collection("heroes").add(heroWithTimestamp);

    hero.id = heroRef.id;

    // Create the userToHero relationship
    const userToHero = {
      heroId: heroRef.id,
      userId: userId,
      currentHp: hero.maxHp,
    };

    // Store the relationship in Firestore
    await db.collection("userToHero").add(userToHero);

    // Send the response back to the client
    res.status(200).send(hero);
  } catch (error) {
    console.error("Error generating hero:", error);
    res.status(500).send({error: "Error generating hero", details: error.message});
  }
};

module.exports = {generateHero};
