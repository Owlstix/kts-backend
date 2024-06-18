const admin = require("firebase-admin");
const db = admin.firestore();

const getWorldState = async (req, res) => {
  try {
    const {userId} = req.query;

    if (!userId) {
      res.status(400).send({error: "User ID is required", query: req.query});
      return;
    }

    // Find the document ID that corresponds to the user ID
    const userWorldStateQuery = await db.collection("userWorldState").where("userId", "==", userId).get();

    if (userWorldStateQuery.empty) {
      res.status(404).send({error: "User world state not found", world: null});
      return;
    }

    // Get the first document from the query result
    const userWorldStateDoc = userWorldStateQuery.docs[0];

    const userWorldState = userWorldStateDoc.data();
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
