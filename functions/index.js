const functions = require("firebase-functions");
const { geminiSayHi } = require("./geminiHelper");

// Export the geminiSayHi function
exports.geminiSayHi = functions.https.onRequest(geminiSayHi);
