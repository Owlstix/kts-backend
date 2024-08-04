const admin = require("firebase-admin");
const db = admin.firestore();

const getWorldState = async (req, res) => {
  try {
    const {userId} = req.body;

    if (!userId) {
      res.status(400).send({error: "User ID is required", query: req.body});
      return;
    }

    // Find the document ID that corresponds to the user ID
    const userWorldStateQuery = await db.collection("userWorldState").where("userId", "==", userId).get();

    let userWorldState;

    if (userWorldStateQuery.empty) {
      // Create a new userWorldState document
      const newUserWorldState = {
        userId,
        food: 20, // Default value
        supplies: 50, // Default value
        morale: 100, // Default value
        passedTutorial: false, // Default value
      };

      // Add the new document to the collection
      await db.collection("userWorldState").add(newUserWorldState);

      // Use the newly created state
      userWorldState = newUserWorldState;
    } else {
      // Get the first document from the query result
      const userWorldStateDoc = userWorldStateQuery.docs[0];
      userWorldState = userWorldStateDoc.data();
    }

    res.status(200).send({
      world: {
        food: userWorldState.food,
        supplies: userWorldState.supplies,
        morale: userWorldState.morale,
        passedTutorial: userWorldState.passedTutorial,
      },
    });
  } catch (error) {
    console.error("Error in getWorldState:", error);
    res.status(500).send({error: "Error processing getWorldState", details: error.message});
  }
};

module.exports = {getWorldState};
