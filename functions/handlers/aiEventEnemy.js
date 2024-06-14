const admin = require("firebase-admin");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const functions = require("firebase-functions");

const db = admin.firestore();

const aiEventEnemy = async (req, res) => {
  try {
    const heroId = req.query.heroId;

    if (!heroId) {
      res.status(400).send({error: "heroId is required"});
      return;
    }

    // Verify that the hero exists
    const heroDoc = await db.collection("heroes").doc(heroId).get();
    if (!heroDoc.exists) {
      res.status(404).send({error: "Hero not found"});
      return;
    }

    const heroData = heroDoc.data();
    const {type, name, sex, attack} = heroData;

    // Verify that the UserToHero document exists
    const userToHeroSnapshot = await db.collection("userToHero").where("heroId", "==", heroId).get();
    if (userToHeroSnapshot.empty) {
      res.status(404).send({error: "userToHero document not found"});
      return;
    }

    const userToHeroData = userToHeroSnapshot.docs[0].data();
    const currentHp = userToHeroData.current_hp;

    // Access the API key from Firebase functions config
    const geminiApiKey = functions.config().gemini.api_key;

    // Initialize the GoogleGenerativeAI with the API key
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // Initialize the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 50,
      },
    });

    // Construct the prompt for generating the event and options
    const prompt = `
    Generate a unique situation for the character with the attributes
    "${type}", "${name}", "${sex}", ${currentHp}, and ${attack}.
    This character is one of the survivors in a cruel dark fantasy world and is
    leaving the village to find food and supplies. Create a story describing what this character
    is doing when they go outside the village, and conclude the story with an
    encounter with an enemy. Generate the enemy's name, hp, and attack. After that,
    provide three options for the hero to choose from. 
    Finally, generate results for each of those options. The results should include
    a description of what happened when the hero chose that option, how many hp were lost, 
    and how much supplies and food were found. Ensure that the results describe the
    conclusion of the event with no further story continuation. Ensure everything follows this JSON schema:

    {
      "eventSetup": {
        "eventStory": "str",
        "enemyName": "str",
        "enemyAttack": "int",
        "enemyHp": "int"
      },
      "options": {
        "option1": "str",
        "option2": "str",
        "option3": "str"
      },
      "option1Results": {
        "result": "str",
        "hpLost": "int",
        "suppliesFound": "int",
        "foodFound": "int"
      },
      "option2Results": {
        "result": "str",
        "hpLost": "int",
        "suppliesFound": "int",
        "foodFound": "int"
      },
      "option3Results": {
        "result": "str",
        "hpLost": "int",
        "suppliesFound": "int",
        "foodFound": "int"
      }
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

    let eventData;
    try {
      eventData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      res.status(500).send({error: "Error parsing Gemini API response", details: jsonError.message});
      return;
    }

    // Send the response back to the client
    res.status(200).send(eventData);
  } catch (error) {
    console.error("Error generating AI event:", error);
    res.status(500).send({error: "Error generating AI event", details: error.message});
  }
};

module.exports = {aiEventEnemy};
