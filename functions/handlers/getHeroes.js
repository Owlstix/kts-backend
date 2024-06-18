const admin = require("firebase-admin");
const {Hero} = require("../types/hero");

const db = admin.firestore();

const getHeroes = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      res.status(400).send({error: "userId is required"});
      return;
    }

    // Find all userToHero documents for the user
    const userToHeroSnapshot = await db.collection("userToHero").where("userId", "==", userId).get();
    if (userToHeroSnapshot.empty) {
      res.status(404).send({error: "No heroes found for the user"});
      return;
    }

    const heroPromises = userToHeroSnapshot.docs.map(async (doc) => {
      const userToHeroData = doc.data();
      const heroId = userToHeroData.heroId;

      // Get hero details from the heroes collection
      const heroDoc = await db.collection("heroes").doc(heroId).get();
      if (!heroDoc.exists) {
        throw new Error(`Hero with heroId ${heroId} not found`);
      }

      const heroData = heroDoc.data();

      if (userToHeroData.currentHp > 0) {
        return new Hero(
            heroId,
            heroData.gender,
            heroData.tier,
            heroData.type,
            heroData.maxHp,
            userToHeroData.currentHp,
            heroData.attack,
            heroData.name,
            heroData.bio,
        );
      } else {
        return null;
      }
    });

    let heroes = await Promise.all(heroPromises);
    // Filter out any null values (heroes with currentHp <= 0)
    heroes = heroes.filter((hero) => hero !== null);

    res.status(200).send({heroes});
  } catch (error) {
    console.error("Error getting heroes:", error);
    res.status(500).send({error: "Error getting heroes", details: error.message});
  }
};

module.exports = {getHeroes};
