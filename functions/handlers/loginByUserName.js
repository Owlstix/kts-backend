const admin = require("firebase-admin");

const db = admin.firestore();

const loginByUserName = async (req, res) => {
  try {
    const username = req.query.username;

    if (!username) {
      res.status(400).send({error: "Username is required"});
      return;
    }

    // Check if the user exists
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.where("username", "==", username).get();

    if (!querySnapshot.empty) {
      // User exists, return the document ID
      const userDoc = querySnapshot.docs[0];
      res.status(200).send({id: userDoc.id});
    } else {
      // User does not exist, create a new user document
      const newUserRef = await usersRef.add({
        username: username,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Return the newly created document ID
      res.status(200).send({id: newUserRef.id});
    }
  } catch (error) {
    console.error("Error in loginByUserName:", error);
    res.status(500).send({error: "Error processing loginByUserName", details: error.message});
  }
};

module.exports = {loginByUserName};
