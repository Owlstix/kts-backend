const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {getDownloadURL} = require("firebase-admin/storage");

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Function to backfill styledAvatarUrl in Firestore
const backfillStyledAvatarUrls = async () => {
  try {
    // Get all files from the styledAvatars folder in Firebase Storage
    const [files] = await bucket.getFiles({prefix: "styledAvatars"});

    // Loop through each file
    for (const file of files) {
      // Extract file name without .jpg extension
      const fileName = file.name.split("/").pop().replace(".jpg", "");

      try {
        // Get the publicly accessible download URL using getDownloadUrl()
        const downloadUrl = await getDownloadURL(file); // Fetch permanent download URL

        // Get the Firestore document reference
        const chibiDocRef = db.collection("chibis").doc(fileName);
        const chibiDoc = await chibiDocRef.get();

        if (chibiDoc.exists) {
          // Update the styledAvatarUrl field in the Firestore document
          await chibiDocRef.update({
            styledAvatarUrl: downloadUrl,
          });
          console.log(`Updated styledAvatarUrl for chibi ID: ${fileName}`);
        } else {
          console.warn(`No chibi document found for ID: ${fileName}`);
        }
      } catch (error) {
        console.error(`Error processing file: ${file.name}`, error);
      }
    }
    console.log("Backfill process completed.");
  } catch (error) {
    console.error("Error during backfill process:", error);
  }
};

// Export the backfill function to be triggered by HTTP request
exports.backfillStyledAvatarUrls = functions.https.onRequest(async (req, res) => {
  try {
    await backfillStyledAvatarUrls();
    res.status(200).send("Backfill of styledAvatarUrl completed successfully.");
  } catch (error) {
    res.status(500).send({
      error: "Error during backfill process",
      details: error.message,
    });
  }
});
