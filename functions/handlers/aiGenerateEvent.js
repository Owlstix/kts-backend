const admin = require("firebase-admin");
const {HERO_TYPE, GENDER} = require("../types/types");
const askGemini = require("../aiProviders/askGemini");
const {
  geminiSystemInstruction,
  heroEventEnemyPrompt,
  heroEventNoEnemyPrompt,
  villageEventTimerPrompt,
} = require("../constants/prompts");


const db = admin.firestore();

const aiGenerateEvent = async (req, res) => {
  try {
    const {userId, heroId, currentHp, food, supplies, morale} = req.body;

    if (!userId || food === undefined || supplies === undefined || morale === undefined) {
      res.status(400).send({error: "userId, food, supplies, and morale are required"});
      return;
    }

    let prompt;

    if (heroId && currentHp !== undefined) {
      // Verify that the hero exists
      const heroDoc = await db.collection("heroes").doc(heroId).get();
      if (!heroDoc.exists) {
        res.status(404).send({error: "Hero not found"});
        return;
      }

      const heroData = heroDoc.data();
      heroData.currentHp = currentHp;
      heroData.type = Object.keys(HERO_TYPE)[heroData.type];
      heroData.gender = Object.keys(GENDER)[heroData.gender].toLowerCase();

      // Decide which prompt to use (50-50 chance)
      const useEnemyPrompt = Math.random() < 0.5;
      prompt = useEnemyPrompt ?
        heroEventEnemyPrompt(heroData.type, heroData.name, heroData.gender, heroData.currentHp, heroData.attack):
        heroEventNoEnemyPrompt(heroData.type, heroData.name, heroData.gender, heroData.currentHp, heroData.attack);
    } else {
      const villageData = {food, supplies, morale};
      prompt = villageEventTimerPrompt(villageData.food, villageData.supplies, villageData.morale);
    }

    // Call the askGemini function with the system instruction and generated prompt
    const eventData = await askGemini(geminiSystemInstruction, prompt);

    // Send the response back to the client
    res.status(200).send(eventData);
  } catch (error) {
    console.error("Error generating AI event:", error);
    res.status(500).send({error: "Error generating AI event", details: error.message});
  }
};

module.exports = {aiGenerateEvent};
