const functions = require("firebase-functions");
const {OpenAI} = require("openai");
const admin = require("firebase-admin");
const fetch = require("node-fetch"); // Ensure you have node-fetch installed

// Configuration
const CONFIG = {
  OPENAI_API_KEY: functions.config().openai.api_key,
  BUCKET_PREFIX: "test",
  IMAGE_EXPIRY_DATE: "03-17-2025",
  FIRESTORE_COLLECTION: "chibis",
};

const db = admin.firestore();
const openai = new OpenAI({apiKey: CONFIG.OPENAI_API_KEY});

// Helper function to get chibi files from storage
/**
 * Retrieves chibi files from Firebase storage with a specific prefix.
 * @return {Promise<Array>} A promise that resolves to an array of chibi files.
 */
async function getChibiFiles() {
  const bucket = admin.storage().bucket();
  const [files] = await bucket.getFiles({prefix: CONFIG.BUCKET_PREFIX});
  return files.filter((file) => file.name.endsWith(".png"));
}

// Function to process each chibi file
/**
 * Processes a single chibi file by generating and storing its description and avatar URL.
 * @param {Object} file The chibi file to process.
 * @return {Promise<void>} A promise that resolves when the file has been processed.
 */
async function processChibiFile(file) {
  const [, type, tier, gender, chibiId] = file.name.split("/");
  const chibiIdWithoutExtension = chibiId.replace(".png", "");

  const chibiDoc = await db.collection(CONFIG.FIRESTORE_COLLECTION).doc(chibiIdWithoutExtension).get();
  if (!chibiDoc.exists) {
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: CONFIG.IMAGE_EXPIRY_DATE,
    });

    const description = await generateDescription(signedUrl);
    const avatarUrl = await generateAvatar(description, chibiIdWithoutExtension);

    await db.collection(CONFIG.FIRESTORE_COLLECTION).doc(chibiIdWithoutExtension).set({
      desc: description,
      gender,
      type,
      tier,
      imageUrl: avatarUrl,
    });
  }
}

// Function to generate description with OpenAI
/**
 * Generates a description for a given image URL using OpenAI.
 * @param {string} imageUrl The URL of the image to generate a description for.
 * @return {Promise<string>} A promise that resolves to the generated description.
 */
async function generateDescription(imageUrl) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {type: "text", text: `Generate description for this character, describe as if it was 
            a real person in real life, description should not be more than 100 words long.`},
          {type: "image_url", image_url: {url: imageUrl}},
        ],
      },
    ],
  });
  return response.choices[0].message.content;
}

// Function to generate avatar with OpenAI and store in Firebase Storage
/**
 * Generates an avatar for a given description using OpenAI and stores it in Firebase Storage.
 * @param {string} description The description of the character to generate an avatar for.
 * @param {string} chibiId The ID of the chibi to use for naming the stored file.
 * @return {Promise<string>} A promise that resolves to the URL of the stored avatar.
 */
async function generateAvatar(description, chibiId) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Generate avatar hero card for this ${description}, 
    setting dark fantasy survival world, no interface and no text on card and make it non chibi real size character.`,
    n: 1,
    size: "1024x1024",
  });

  const avatarUrl = response.data[0].url;

  // Download the avatar image
  const imageResponse = await fetch(avatarUrl);
  const imageBuffer = await imageResponse.buffer();

  // Upload the avatar image to Firebase Storage
  const bucket = admin.storage().bucket();
  const fileName = `pregeneratedAvatars/${chibiId}.png`;
  const file = bucket.file(fileName);
  await file.save(imageBuffer, {
    metadata: {
      contentType: "image/png",
    },
  });

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

// Main backfill function
const backfillChibis = async () => {
  const chibiFiles = await getChibiFiles();
  for (const file of chibiFiles) {
    await processChibiFile(file);
  }
};

// Export the function with error handling
exports.backfillChibis = functions.https.onRequest(async (req, res) => {
  try {
    await backfillChibis();
    res.status(200).send("Backfill completed successfully.");
  } catch (error) {
    console.error("Error during backfill:", error);
    res.status(500).send({error: "Error during backfill", details: error.message});
  }
});
