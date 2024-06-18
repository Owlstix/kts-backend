const admin = require("firebase-admin");

const db = admin.firestore();

const loginByUserName = async (req, res) => {
  try {
    const {username} = req.body;

    if (!username) {
      res.status(400).send({error: "Username is required", body: req.body});
      return;
    }

    // Check if the user exists
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.where("username", "==", username).get();

    let userDoc;
    let statusCode = 200;

    if (!querySnapshot.empty) {
      // User exists, return the document ID
      userDoc = querySnapshot.docs[0];
    } else {
      // User does not exist, create a new user document
      userDoc = await usersRef.add({
        username: username,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      statusCode = 201; // Created
    }

    // Return the document ID
    res.status(statusCode).send({
      user: {
        id: userDoc.id,
        name: username,
      },
    });
  } catch (error) {
    res.status(500).send({error: "Something went wrong", details: error.message});
  }
};

module.exports = {loginByUserName};
