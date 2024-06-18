const admin = require("firebase-admin");

const db = admin.firestore();

const updateUserState = async (req, res) => {
  try {
    const {userId, world, heroes} = req.body;

    if (!userId) {
      res.status(400).send({error: "userId is required"});
      return;
    }

    // Update world state if provided
    if (world) {
      const {morale, supplies, food, passedTutorial} = world;

      const userWorldStateSnapshot = await db.collection("userWorldState")
          .where("userId", "==", userId)
          .get();

      let worldRef;
      if (!userWorldStateSnapshot.empty) {
        // If userWorldState exists, get the document reference
        worldRef = userWorldStateSnapshot.docs[0].ref;
      } else {
        // If not, create a new document reference
        worldRef = db.collection("userWorldState").doc();
      }

      const worldUpdate = {
        userId, // Include userId in the update
        morale,
        supplies,
        food,
        passedTutorial,
      };

      if (Object.keys(worldUpdate).length > 0) {
        await worldRef.set(worldUpdate, {merge: true});
      }
    }

    // Update heroes state if provided
    if (heroes && Array.isArray(heroes)) {
      const heroPromises = heroes.map(async (hero) => {
        const {id, currentHP} = hero;

        if (id && typeof currentHP === "number") {
          const userToHeroSnapshot = await db.collection("userToHero")
              .where("userId", "==", userId)
              .where("heroId", "==", id)
              .get();

          if (!userToHeroSnapshot.empty) {
            const heroDoc = userToHeroSnapshot.docs[0];
            await heroDoc.ref.update({currentHp: currentHP});
          } else {
            console.warn(`Hero with id ${id} for user ${userId} not found, skipping update.`);
          }
        }
      });

      await Promise.all(heroPromises);
    }

    res.status(200).send({message: "User state updated successfully"});
  } catch (error) {
    console.error("Error updating user state:", error);
    res.status(500).send({error: "Error updating user state", details: error.message});
  }
};

module.exports = {updateUserState};
