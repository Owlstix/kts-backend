const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import functions
const {geminiSayHi} = require("./handlers/geminiTest");
const {loginByUserName} = require("./handlers/loginByUserName");

// Export functions
exports.geminiSayHi = functions.https.onRequest(geminiSayHi);
exports.loginByUserName = functions.https.onRequest(loginByUserName);
