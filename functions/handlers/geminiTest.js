const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {GoogleGenerativeAI} = require("@google/generative-ai");

admin.initializeApp();

const db = admin.firestore();

const geminiSayHi = async (req, res) => {
  try {
    // Access the API key from Firebase functions config
    const geminiApiKey = functions.config().gemini.api_key;

    // Initialize the GoogleGenerativeAI with the API key
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // Configure the Gemini AI model
    const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

    // Define the prompt and parameters
    const prompt = `Generate 5 unique settings or areas for battles
      in a mysterious world. Ensure each setting is distinct. Provide only name of each area in a list format.`;
    const parameters = {
      temperature: 0.7, // Adjust the temperature for creativity
      top_p: 0.9, // Adjust top-p for nucleus sampling
      top_k: 50, // Adjust top-k for top-k sampling
    };

    // Generate content using the Gemini AI model
    const result = await model.generateContent(prompt, parameters);
    const response = result.response;
    const text = await response.text();

    // Split the response text into individual settings (assuming each setting is on a new line)
    const settings = text.split("\n").map((setting) => setting.trim()).filter((setting) => setting);

    // Store each setting as a separate document in Firestore
    const batch = db.batch();
    settings.forEach((setting, index) => {
      const docRef = db.collection("battleSettings").doc(`setting_${index}`);
      batch.set(docRef, {name: setting, timestamp: admin.firestore.FieldValue.serverTimestamp()});
    });

    await batch.commit();

    // Send the response back to the client
    res.status(200).send({message: "Settings stored successfully", settings});
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).send({error: "Error calling Gemini API", details: error.message});
  }
};

module.exports = {geminiSayHi};
