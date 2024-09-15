const functions = require("firebase-functions");
const {OpenAI} = require("openai");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Configuration
const CONFIG = {
  OPENAI_API_KEY: functions.config().openai.api_key,
  BUCKET_PREFIX: "test",
  IMAGE_EXPIRY_DATE: "03-17-2025",
  FIRESTORE_COLLECTION: "chibis",
  BATCH_SIZE: 5, // Number of files to process in each batch
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
  console.log("Processing chibi file:", chibiId);
  console.log("filename:", file.name);
  const chibiIdWithoutExtension = chibiId.replace(".png", "");

  const chibiDoc = await db.collection(CONFIG.FIRESTORE_COLLECTION).doc(chibiIdWithoutExtension).get();
  if (!chibiDoc.exists) {
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: CONFIG.IMAGE_EXPIRY_DATE,
    });

    // Pass gender to generateDescription
    const description = await generateDescription(signedUrl, gender, type);
    // Pass gender to generateAvatar along with description and chibiIdWithoutExtension
    await generateAvatar(description, chibiIdWithoutExtension, gender, type);

    await db.collection(CONFIG.FIRESTORE_COLLECTION).doc(chibiIdWithoutExtension).set({
      desc: description,
      gender,
      type,
      tier,
    });
  }
}

// Function to generate description with OpenAI
/**
 * Generates a description for a given image URL using OpenAI.
 * @param {string} imageUrl The URL of the image to generate a description for.
 * @param {string} gender The gender of the character.
 * @param {string} type The type of the character.
 * @return {Promise<string>} A promise that resolves to the generated description.
 */
async function generateDescription(imageUrl, gender, type) {
  const prompt = `Picture depicts ${gender} ${type}. 
    describe exact looks of character on the picture as if it was non-chibi full size character in dark fantasy world, 
    add dynamical pose description, add description of background and environment. 
    description should not be more than 150 words long.`;
  console.log("Sending prompt to OpenAI in generateDescription:", prompt); // Logging the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {type: "text", text: prompt},
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
 * @param {string} gender The gender of the character.
 * @param {string} type The type of the character.
 * @return {Promise<string>} A promise that resolves to the URL of the stored avatar.
 */
async function generateAvatar(description, chibiId, gender, type) {
  const prompt =
  `Сreate a stunning digital artwork, style mix of Arcane series and Borderlands game. 
  that depicts a dynamic scene featuring ${gender} ${type} hero, ${description}. 
  The atmosphere should be intense and dramatic, with intricate details, and rich textures. Use a dark, 
  moody color palette to capture the unique visual style of dark fantasy.
  Ensure the composition is visually engaging, with a strong sense of depth and movement. 
  no text should be used. Do not make glowing eyes.`;
  console.log("Sending prompt to OpenAI in generateAvatar:", prompt); // Logging the prompt
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
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
}

// Main backfill function with batching
const backfillChibis = async () => {
  const chibiFiles = await getChibiFiles();
  for (let i = 0; i < chibiFiles.length; i += CONFIG.BATCH_SIZE) {
    const batch = chibiFiles.slice(i, i + CONFIG.BATCH_SIZE);
    await Promise.all(batch.map(processChibiFile));
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
