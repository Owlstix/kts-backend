const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import functions
const {geminiSayHi} = require("./handlers/geminiTest");
const {loginByUserName} = require("./handlers/loginByUserName");
const {generateHero} = require("./handlers/generateHero");
const {getHeroes} = require("./handlers/getHeroes");
const {aiEventEnemy} = require("./handlers/aiEventEnemy");

// Export functions
exports.geminiSayHi = functions.https.onRequest(geminiSayHi);
exports.loginByUserName = functions.https.onRequest(loginByUserName);
exports.generateHero = functions.https.onRequest(generateHero);
exports.getHeroes = functions.https.onRequest(getHeroes);
exports.aiEventEnemy = functions.https.onRequest(aiEventEnemy);
