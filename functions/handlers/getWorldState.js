const admin = require("firebase-admin");
const db = admin.firestore();

const getWorldState = async (req, res) => {
  try {
    const {userId} = req.query;

    if (!userId) {
      res.status(400).send({error: "User ID is required", query: req.query});
      return;
    }

    // Get the user's world state
    const userWorldStateRef = db.collection("userWorldState").doc(userId);
    const userWorldStateDoc = await userWorldStateRef.get();

    if (!userWorldStateDoc.exists) {
      res.status(404).send({error: "User world state not found", world: null});
      return;
    }

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
