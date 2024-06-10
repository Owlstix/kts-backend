const functions = require("firebase-functions");
const {geminiSayHi} = require("./handlers/geminiTest");

// Export the geminiSayHi function
exports.geminiSayHi = functions.https.onRequest(geminiSayHi);
