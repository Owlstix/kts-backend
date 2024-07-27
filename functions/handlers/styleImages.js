const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const path = require("path");
const FormData = require("form-data");
const leonardoai = require("@api/leonardoai");

const db = admin.firestore();

// Configuration
const CONFIG = {
  LEONARDO_API_KEY: functions.config().leonardo.api_key,
  IMAGE_EXPIRY_DATE: "03-17-2025",
  PREGENERATED_AVATARS_FOLDER: "pregeneratedAvatars",
  STYLE_REFERENCES_FOLDER: "styleReference",
  STYLED_AVATARS_FOLDER: "styledAvatars",
};

leonardoai.auth(CONFIG.LEONARDO_API_KEY);

/**
 * Retrieves files from Firebase storage with a specific prefix.
 * @param {string} prefix The prefix to filter files.
 * @return {Promise<Array>} A promise that resolves to an array of files.
 */
async function getFiles(prefix) {
  const bucket = admin.storage().bucket();
  const [files] = await bucket.getFiles({prefix});
  return files.filter((file) => file.name.endsWith(".png"));
}

/**
 * Uploads an image to Leonardo AI and returns the initImageId.
 * @param {string} signedUrl The signed URL of the image to upload.
 * @return {Promise<string>} A promise that resolves to the initImageId.
 */
async function uploadImageToLeonardo(signedUrl) {
  try {
    const initImageResponse = await fetch("https://cloud.leonardo.ai/api/rest/v1/init-image", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": `Bearer ${CONFIG.LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({extension: "png"}),
    });

    if (!initImageResponse.ok) {
      const errorBody = await initImageResponse.text(); // Get more details from the response body
      throw new Error(`Failed to get presigned URL: ${initImageResponse.statusText}, Details: ${errorBody}`);
    }

    const initImageData = await initImageResponse.json();
    const {url, fields: rawFields, id: imageId} = initImageData.uploadInitImage;

    const imageResponse = await fetch(signedUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }
    const imageBuffer = await imageResponse.buffer();

    const fields = JSON.parse(rawFields);
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("file", imageBuffer, {filename: "image.png", contentType: "image/png"});

    const uploadResponse = await fetch(url, {
      method: "POST",
      headers: formData.getHeaders(),
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorBody = await uploadResponse.text(); // Get more details from the response body
      throw new Error(`Failed to upload image to Leonardo AI: ${uploadResponse.statusText}, Details: ${errorBody}`);
    }

    return imageId;
  } catch (error) {
    console.error("Error during image upload:", error.message);
    throw new Error("Failed to upload image to Leonardo AI");
  }
}

/**
 * Checks if style reference images are already uploaded and returns their initImageIds.
 * If not, uploads the style reference images and stores their initImageIds in Firestore.
 * @return {Promise<Array>} A promise that resolves to an array of initImageIds.
 */
async function getOrUploadStyleReferences() {
  const styleRefFiles = await getFiles(CONFIG.STYLE_REFERENCES_FOLDER);
  const styleRefPromises = styleRefFiles.map(async (file) => {
    const fileName = path.basename(file.name, ".png"); // Strip the .png extension for the document ID
    const styleRefDocRef = db.collection("styleReferenceInitImageId").doc(fileName);
    const styleRefDoc = await styleRefDocRef.get();
    if (styleRefDoc.exists) {
      return styleRefDoc.data().initImageId;
    } else {
      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires: CONFIG.IMAGE_EXPIRY_DATE,
      });
      const initImageId = await uploadImageToLeonardo(signedUrl);
      await styleRefDocRef.set({initImageId});
      return initImageId;
    }
  });
  return Promise.all(styleRefPromises);
}

/**
 * Fetches the generated image URL from Leonardo AI using the generation ID.
 * @param {string} generationId The generation ID to fetch the image.
 * @return {Promise<string>} A promise that resolves to the generated image URL.
 */
async function fetchGeneratedImageUrl(generationId) {
  const maxAttempts = 10;
  const delay = 5000; // 5 seconds
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await leonardoai.getGenerationById({id: generationId});
    if (response.data.generations_by_pk.status === "COMPLETE") {
      return response.data.generations_by_pk.generated_images[0].url;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Failed to fetch generated image URL: Timeout");
}

/**
 * Processes an image with style references using Leonardo AI.
 * @param {Object} file The file to process.
 * @param {Array} styleReferences The style references to apply.
 * @return {Promise<string>} A promise that resolves to the URL of the styled image.
 */
async function processImageWithStyleReferences(file, styleReferences) {
  const [signedUrl] = await file.getSignedUrl({
    action: "read",
    expires: CONFIG.IMAGE_EXPIRY_DATE,
  });

  console.log("Generated signed URL:", signedUrl);

  // Upload the image to Leonardo AI to get the initImageId
  const initImageId = await uploadImageToLeonardo(signedUrl);

  console.log("Init image ID:", initImageId);

  const generationResponse = await leonardoai.createGeneration({
    height: 1024,
    width: 1024,
    modelId: "b24e16ff-06e3-43eb-8d33-4416c2d75876",
    prompt: "dark fantasy setting character, dynamic scene, keep colours identical to original image",
    presetStyle: "DYNAMIC",
    photoReal: false,
    alchemy: true,
    num_images: 1,
    // negative_prompt: "dirty face, black lines on face, sketchy face, artifacts on face, dots on face",
    contrastRatio: 1,
    init_image_id: initImageId,
    init_strength: 0.90,
    controlnets: styleReferences,
    elements: [{
      akUUID: "12eb63cd-da9e-440a-958d-f09595829256", // Oldschool Comic
      weight: 1.10,
    }],
  });

  console.log("Generation response from Leonardo AI:", generationResponse);

  const generationId = generationResponse.data.sdGenerationJob.generationId;

  console.log("Generation ID:", generationId);

  const generatedImageUrl = await fetchGeneratedImageUrl(generationId);

  console.log("Generated image URL:", generatedImageUrl);

  const imageResponse = await fetch(generatedImageUrl);
  const imageBuffer = await imageResponse.buffer();

  console.log("Generated image buffer:", imageBuffer);

  const bucket = admin.storage().bucket();
  const imageName = path.basename(file.name, ".png"); // Strip the .png extension from the imageName
  const fileName = `${CONFIG.STYLED_AVATARS_FOLDER}/${imageName}.png`; // Add .png here for the fileName in storage
  const storageFile = bucket.file(fileName);

  console.log("Saving image to storage:", fileName);

  await storageFile.save(imageBuffer, {
    metadata: {
      contentType: "image/png",
    },
  });

  console.log("Image saved to storage:", fileName);

  // Firestore interaction starts here
  const chibiDocRef = db.collection("chibis").doc(imageName); // Use imageName without .png as doc ID
  const chibiDoc = await chibiDocRef.get();
  if (chibiDoc.exists && chibiDoc.data().styledAvatarUrl) {
    throw new Error(`Styled avatar URL already exists for ${imageName}`);
  } else {
    const styledImageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    await chibiDocRef.set({styledAvatarUrl: styledImageUrl}, {merge: true});
    console.log(`Styled avatar URL updated for ${imageName}`);
    return styledImageUrl;
  }
}

/**
 * Main function to style images in batches.
 */
const styleImages = async () => {
  const avatarFiles = await getFiles(CONFIG.PREGENERATED_AVATARS_FOLDER);
  const bucket = admin.storage().bucket();

  // Upload style references to get their initImageIds
  const styleRefIds = await getOrUploadStyleReferences();
  const styleReferences = styleRefIds.map((initImageId, index) => ({
    initImageId,
    initImageType: "UPLOADED",
    preprocessorId: 67,
    strengthType: "Max",
    // weight: index < 2 ? 0.50 : 0.30, // First two images with weight 0.50, next two with weight 0.30
  }));

  for (const file of avatarFiles) {
    const imageName = path.basename(file.name);
    const styledFileName = `${CONFIG.STYLED_AVATARS_FOLDER}/${imageName}`;
    const [fileExists] = await bucket.file(styledFileName).exists();

    if (!fileExists) {
      // Only process the image if it doesn't already exist in the styledAvatars folder
      await processImageWithStyleReferences(file, styleReferences);
      break; // Stop after processing one image fully
    } else {
      console.log(`Skipping ${imageName}, already exists in styledAvatars folder.`);
    }
  }
};

// Export the function with error handling
exports.styleImages = functions.https.onRequest(async (req, res) => {
  try {
    await styleImages();
    res.status(200).send("Styling completed successfully.");
  } catch (error) {
    console.error("Error during styling:", error);
    res.status(500).send({error: "Error during styling", details: error.message});
  }
});

