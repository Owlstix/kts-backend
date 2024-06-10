const functions = require("firebase-functions");
const {geminiSayHi} = require("./geminiTest");

// Export the geminiSayHi function
exports.geminiSayHi = functions.https.onRequest(geminiSayHi);
