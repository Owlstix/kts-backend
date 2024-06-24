const functions = require("firebase-functions");
const {OpenAI} = require("openai");

// Initialize OpenAI with API key and other config from Firebase config
const openai = new OpenAI({
  apiKey: functions.config().openai.api_key,
});

const askChatGpt = async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Create a completion request
    const completionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {role: "system", content: "You are a helpful assistant."},
        {role: "user", content: userMessage},
      ],
    });

    const reply = completionResponse.choices[0].message.content;

    res.json({reply});
  } catch (error) {
    console.error("Error fetching response:", error);
    res.status(500).send({error: "Internal Server Error", details: error.message});
  }
};

module.exports = {askChatGpt};
