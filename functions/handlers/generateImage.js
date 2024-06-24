const functions = require("firebase-functions");
const {OpenAI} = require("openai");
const admin = require("firebase-admin");
const fetch = require("node-fetch"); // Ensure you have node-fetch installed

const db = admin.firestore();

const openai = new OpenAI({
  apiKey: functions.config().openai.api_key,
});

const generateImage = async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      res.status(400).send({error: "Prompt is required"});
      return;
    }

    // Generate image using OpenAI DALL-E
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      n: 1,
    });

    // Log the entire response for debugging purposes
    console.log("OpenAI API response:", JSON.stringify(response));

    const imageUrl = response.data[0].url;
    if (!imageUrl) {
      throw new Error("Image URL not found in the response");
    }

    // Download the image using fetch
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.buffer();

    // Upload the image to Firebase Storage
    const bucket = admin.storage().bucket();
    const fileName = `images/${Date.now()}_${Math.random().toString(36).substring(7)}.png`;
    const file = bucket.file(fileName);
    await file.save(imageBuffer, {
      metadata: {
        contentType: "image/png",
      },
    });

    const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    // Store the image URL in Firestore
    const docRef = await db.collection("images").add({
      prompt,
      url: fileUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send({id: docRef.id, url: fileUrl});
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).send({error: "Error generating image", details: error.message});
  }
};

module.exports = {generateImage};
