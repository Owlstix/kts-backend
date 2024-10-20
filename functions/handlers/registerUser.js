// Register User Function (registerUser.js)
const functions = require("firebase-functions");
const {initializeApp} = require("firebase/app");
const {getAuth, createUserWithEmailAndPassword} = require("firebase/auth");
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

const db = admin.firestore();

// Frontend Emulator Cloud Function for Registering a User
exports.registerUser = functions.https.onRequest(async (req, res) => {
  const {email, password} = req.body;

  const auth = getAuth();

  if (!email || !password) {
    return res.status(400).send({error: "Email and password are required."});
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add user to Firestore collection "users"
    await db.collection("users").doc(user.uid).set({
      username: user.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Generate the ID token
    const idToken = await user.getIdToken();

    return res.status(201).send({
      message: "User registered successfully",
      user: {
        uid: user.uid,
        email: user.email,
      },
      token: idToken,
    });
  } catch (error) {
    // Handle errors from Firebase Authentication
    console.error("Registration error:", error);
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
    case "auth/email-already-in-use":
      return res.status(400).send({error: "Email is already in use."});
    case "auth/invalid-email":
      return res.status(400).send({error: "Invalid email address."});
    case "auth/weak-password":
      return res.status(400).send({error: "Password is too weak."});
    default:
      return res.status(500).send({error: "An error occurred.", details: error.message});
  }
}
