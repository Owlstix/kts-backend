const admin = require("firebase-admin");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const functions = require("firebase-functions");
const {HERO_TYPE, GENDER} = require("../utils/constants");

const db = admin.firestore();

const aiGenerateEvent = async (req, res) => {
  try {
    const {userId, heroId, currentHp, food, supplies, morale} = req.body;

    if (!userId || food === undefined || supplies === undefined || morale === undefined) {
      res.status(400).send({error: "userId, food, supplies, and morale are required"});
      return;
    }

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

    let prompt;

    if (heroId && currentHp !== undefined) {
      // Verify that the hero exists
      const heroDoc = await db.collection("heroes").doc(heroId).get();
      if (!heroDoc.exists) {
        res.status(404).send({error: "Hero not found"});
        return;
      }

      const heroData = heroDoc.data();
      const {type, name, gender, attack} = heroData;

      // Decide which prompt to use (50-50 chance)
      const useEnemyPrompt = Math.random() < 0.5;

      // Construct the appropriate prompt
      prompt = useEnemyPrompt ?
        `
        Generate a unique situation for the character which has 
        Class: ${Object.keys(HERO_TYPE)[type]} 
        Name: "${name}" 
        Gender: ${Object.keys(GENDER)[gender].toLowerCase()} 
        Current HP: ${currentHp}
        Attack Power ${attack}
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
            "enemy": {
              "name": "str",
              "attack": "int",
              "hp": "int"
            }
          },
          "options": [
            {
              "option": "str",
              "result": {
                "desc": "str",
                "hpDelta": "int",
                "suppliesDelta": "int",
                "foodDelta": "int"
              }
            }
          ]
        }
        ` :
        `
        Generate a unique situation for the character with the following details:
        Class: ${Object.keys(HERO_TYPE)[type]}
        Name: "${name}"
        Gender: ${Object.keys(GENDER)[gender].toLowerCase()} 
        Current HP: ${currentHp}
        Attack Power: ${attack}
       
        This character is one of the survivors in a cruel dark fantasy world and is 
        leaving the village to find food and supplies. Generate an event that does not 
        include enemy encounters but requires the player to make morally complex choices. 
        Provide the event story, followed by three options for what the hero can do, and 
        include a description of the outcome for each option. Each event result should 
        affect the current HP of the hero, supplies, or food.
        Ensure everything follows this JSON schema:
       
        {
          "eventSetup": {
            "eventStory": "str"
          },
          "options": [
            {
              "option": "str",
              "result": {
                "desc": "str",
                "hpDelta": "int",
                "suppliesDelta": "int",
                "foodDelta": "int"
              }
            }
          ]
        }
        `;
    } else {
      // Construct the village prompt
      prompt = `
      Generate a unique event for a village inhabited by heroes in a cruel dark fantasy world. You should create 
      a situation where the village is facing a crisis and the heroes must make a difficult decision.
      The village has the following attributes:
      Food: ${food}
      Supplies: ${supplies}
      Morale: ${morale}

      Create three distinct and grim event options for the village. 
      Each option should be unique and potentially cruel.
      After presenting the options, generate the outcomes for each. 
      The outcomes should include a detailed description of what happened and 
      indicate changes in the village's supplies, food, and morale.
      Ensure that all outputs follow this JSON schema:

      {
        "eventSetup": {
          "eventStory": "str"
        },
        "options": [
          {
            "option": "str",
            "result": {
              "desc": "str",
              "suppliesDelta": "int",
              "foodDelta": "int",
              "moraleDelta": "int"
            }
          }
        ]
      }
      `;
    }

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

module.exports = {aiGenerateEvent};
