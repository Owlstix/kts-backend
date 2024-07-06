const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import functions
const {loginByUserName} = require("./handlers/loginByUserName");
const {generateHero} = require("./handlers/generateHero");
const {getHeroes} = require("./handlers/getHeroes");
const {aiGenerateEvent} = require("./handlers/aiGenerateEvent");
const {updateUserState} = require("./handlers/updateUserState");
const {getWorldState} = require("./handlers/getWorldState");
const {askChatGpt} = require("./handlers/askChatGpt");
const {generateImage} = require("./handlers/generateImage");
const {backfillChibis} = require("./handlers/backfillChibis");

// Export functions
exports.loginByUserName = functions.https.onRequest(loginByUserName);
exports.generateHero = functions.https.onRequest(generateHero);
exports.getHeroes = functions.https.onRequest(getHeroes);
exports.aiGenerateEvent = functions.https.onRequest(aiGenerateEvent);
exports.updateUserState = functions.https.onRequest(updateUserState);
exports.getWorldState = functions.https.onRequest(getWorldState);
exports.askChatGpt = functions.https.onRequest(askChatGpt);
exports.generateImage = functions.https.onRequest(generateImage);
exports.backfillChibis = functions.runWith({
  timeoutSeconds: 540,
  memory: "2GB",
}).https.onRequest(backfillChibis);
