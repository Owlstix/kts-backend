const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require("path");

const bucket = admin.storage().bucket(); // Reference to the default storage bucket

// Cloud function to rename .png files to .jpg and update metadata
exports.convertToJpg = functions.runWith({
  timeoutSeconds: 540,
  memory: "2GB",
}).https.onRequest(async (req, res) => {
  try {
    const [files] = await bucket.getFiles({prefix: "styledAvatars/"}); // List all files in the styledAvatars folder

    for (const file of files) {
      if (file.name.endsWith(".png")) {
        const fileNameWithoutExt = path.basename(file.name, ".png"); // Get the file name without .png
        const newFileName = `styledAvatars/${fileNameWithoutExt}.jpg`; // Create the new file name with .jpg

        // Copy the file to the new name (renaming)
        await bucket.file(file.name).copy(bucket.file(newFileName));

        // Update the metadata to reflect the new content type (image/jpg)
        await bucket.file(newFileName).setMetadata({
          contentType: "image/jpg",
        });

        // Delete the old .png file after renaming
        await bucket.file(file.name).delete();

        console.log(`Renamed ${file.name} to ${newFileName} and updated metadata.`);
      }
    }

    res.status(200).send({message: "Files renamed to .jpg and metadata updated successfully."});
  } catch (error) {
    console.error("Error during renaming and metadata update:", error);
    res.status(500).send({
      error: "Error during renaming and metadata update",
      details: error.message,
    });
  }
});
