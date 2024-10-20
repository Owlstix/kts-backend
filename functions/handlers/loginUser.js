// Login User Function (loginUser.js)
const functions = require("firebase-functions");
const {initializeApp} = require("firebase/app");
const {getAuth, signInWithEmailAndPassword} = require("firebase/auth");
const admin = require("firebase-admin");

// Firebase Web SDK Config
const firebaseConfig = {
  apiKey: functions.config().fbase.api_key,
  authDomain: functions.config().fbase.auth_domain,
  projectId: functions.config().fbase.project_id,
};

// Initialize Firebase App for Web SDK (Frontend Emulator)
initializeApp(firebaseConfig);

// Initialize Admin SDK (for Firestore)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Frontend Emulator Cloud Function for Logging in a User
exports.loginUser = functions.https.onRequest(async (req, res) => {
  const {email, password} = req.body;

  const auth = getAuth();

  if (!email || !password) {
    return res.status(400).send({error: "Email and password are required."});
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Generate the ID token
    const idToken = await user.getIdToken();

    return res.status(200).send({
      message: "User logged in successfully",
      user: {
        uid: user.uid,
        email: user.email,
      },
      token: idToken,
    });
  } catch (error) {
    // Handle errors from Firebase Authentication
    console.error("Login error:", error);
    return handleFirebaseAuthError(error, res);
  }
});

/**
 * Handles Firebase authentication errors by sending the appropriate response to the client.
 *
 * @param {Error} error The error object received from Firebase authentication.
 * @param {Object} res The response object used to send back the HTTP response.
 * @return {Object} The response object with the error message and status code.
 */
function handleFirebaseAuthError(error, res) {
  switch (error.code) {
    case "auth/user-not-found":
      return res.status(404).send({error: "User not found."});
    case "auth/invalid-email":
      return res.status(400).send({error: "Invalid email address."});
    case "auth/wrong-password":
      return res.status(400).send({error: "Incorrect password."});
    default:
      return res.status(500).send({error: "An error occurred.", details: error.message});
  }
}
