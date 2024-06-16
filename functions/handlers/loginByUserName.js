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
      // User exists, return the document ID and current world state
      const userDoc = querySnapshot.docs[0];
      const userWorldStateRef = db.collection("userWorldState").doc(userDoc.id);
      const userWorldStateDoc = await userWorldStateRef.get();
      if (!userWorldStateDoc.exists) {
        res.status(404).send({error: "User world state not found"});
        return;
      }
      const userWorldState = userWorldStateDoc.data();
      res.status(200).send({
        user: {
          id: userDoc.id,
          name: username,
        },
        world: {
          food: userWorldState.food,
          supplies: userWorldState.supplies,
          morale: userWorldState.morale,
        },
      });
    } else {
      // User does not exist, create a new user document
      const newUserRef = await usersRef.add({
        username: username,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create a document in userWorldState collection
      const userWorldStateRef = db.collection("userWorldState").doc(newUserRef.id);
      await userWorldStateRef.set({
        userId: newUserRef.id,
        food: 50,
        supplies: 50,
        morale: 50,
      });

      // Return the newly created document ID and initial world state
      res.status(200).send({
        user: {
          id: newUserRef.id,
          name: username,
        },
        world: {
          morale: 50,
          supplies: 50,
          food: 50,
        },
      });
    }
  } catch (error) {
    console.error("Error in loginByUserName:", error);
    res.status(500).send({error: "Error processing loginByUserName", details: error.message});
  }
};

module.exports = {loginByUserName};
