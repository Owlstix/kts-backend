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
const {backfillChibis} = require("./handlers/backfillChibis");
const {styleImages} = require("./handlers/styleImages");
const {backfillStyledAvatarUrls} = require("./handlers/backfillStyledAvatarUrls");
const {convertToJpg} = require("./handlers/convertToJpg");
const {chatWithHero} = require("./handlers/chatWithHero");

// Export functions
exports.loginByUserName = functions.https.onRequest(loginByUserName);
exports.generateHero = functions.https.onRequest(generateHero);
exports.getHeroes = functions.https.onRequest(getHeroes);
exports.aiGenerateEvent = functions.https.onRequest(aiGenerateEvent);
exports.updateUserState = functions.https.onRequest(updateUserState);
exports.getWorldState = functions.https.onRequest(getWorldState);
exports.styleImages = functions.https.onRequest(styleImages);
exports.backfillStyledAvatarUrls = functions.https.onRequest(backfillStyledAvatarUrls);
exports.convertToJpg = functions.https.onRequest(convertToJpg);
exports.chatWithHero = functions.https.onRequest(chatWithHero);
exports.backfillChibis = functions.runWith({
  timeoutSeconds: 540,
  memory: "2GB",
}).https.onRequest(backfillChibis);
