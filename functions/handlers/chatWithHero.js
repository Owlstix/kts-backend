const functions = require("firebase-functions");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const db = admin.firestore();

const openai = new OpenAI({
  apiKey: functions.config().openai.api_key,
});

/**
 * Handles requests to chat with a hero by either continuing an existing conversation
 * or creating a new thread and starting a conversation.
 *
 * @param {Object} req - Express request object containing userId, heroId, and message.
 * @param {Object} res - Express response object for sending results back to the client.
 */
exports.chatWithHero = functions.https.onRequest(async (req, res) => {
  const {userId, heroId, message} = req.body;

  if (!userId || !heroId || !message) {
    return res.status(400).send({error: "Invalid request data"});
  }

  try {
    // Query to find the document with matching userId and heroId
    const userHeroQuery = db.collection("userToHero")
        .where("userId", "==", userId)
        .where("heroId", "==", heroId);

    const userHeroSnapshot = await userHeroQuery.get();

    if (userHeroSnapshot.empty) {
      return res.status(404).send({error: "No matching document found."});
    }

    let threadId;
    const userHeroDoc = userHeroSnapshot.docs[0]; // Assume the first result is the correct one

    if (userHeroDoc.exists && userHeroDoc.data().threadId) {
      // Thread exists, continue conversation by creating a run
      threadId = userHeroDoc.data().threadId;
      await continueConversation(threadId, message, res);
    } else {
      // Thread doesn't exist, create a new thread and run
      const {assistantResponse, threadId} = await createNewThreadAndRun(message);

      // Update the existing document with the new threadId
      await userHeroDoc.ref.update({threadId});

      // Return the assistant's response and thread ID in the desired format
      res.status(200).send({
        message: assistantResponse,
        threadId: threadId,
      });
    }
  } catch (error) {
    console.error("Error handling chat with hero:", error);
    res.status(500).send({error: "Internal Server Error"});
  }
});

/**
 * Creates a new thread and run with the provided user message and retrieves the assistant's response.
 *
 * @param {string} message - The user's message to initiate the conversation.
 * @return {Promise<{assistantResponse: string, threadId: string}>} - A promise that resolves to an object
 */
async function createNewThreadAndRun(message) {
  try {
    // Step 1: Create a new thread with the user's message
    const newThread = await openai.beta.threads.create({
      messages: [{role: "user", content: message}],
    });

    const threadId = newThread.id;

    // Step 2: Create a run to process the user's message
    const runResponse = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_dDBkGhNjCSlloquyL43dn99i", // Replace with your actual assistant ID
      model: "gpt-4o", // Or whatever model you're using
    });

    // Polling mechanism to check when the run is complete
    const maxAttempts = 10; // Set a limit on how many times we check
    const delay = 3000; // Wait for 3 seconds between checks

    let runStatus = runResponse.status;
    const runId = runResponse.id;
    let attempt = 0;

    while (attempt < maxAttempts) {
      // Step 3: Check the status of the run
      const runStatusResponse = await openai.beta.threads.runs.retrieve(threadId, runId);
      runStatus = runStatusResponse.status;

      if (runStatus === "completed") {
        // Step 4: Run is completed, now list the messages to get the assistant's reply
        const messageResponse = await openai.beta.threads.messages.list(threadId, {
          limit: 20, // Adjust as needed
          order: "desc",
        });

        // Step 5: Find the assistant's message in the thread
        const assistantMessage = messageResponse.data.find(
            (msg) => msg.role === "assistant",
        );

        if (assistantMessage && assistantMessage.content && assistantMessage.content[0]) {
          const assistantResponse = assistantMessage.content[0].text.value;
          // Return both assistant response and threadId
          return {assistantResponse, threadId};
        } else {
          throw new Error("No valid assistant response found in the messages.");
        }
      } else if (runStatus === "failed") {
        throw new Error("Run failed during processing.");
      }

      // Wait before checking again
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }

    throw new Error("Run timed out before completion.");
  } catch (error) {
    console.error("Error in createNewThreadAndRun:", error);
    throw error;
  }
}

/**
 * Continues an existing conversation by adding the user's message to the thread and creating a run.
 *
 * @param {string} threadId - The thread ID of the existing conversation.
 * @param {string} message - The user's message to be added to the thread.
 * @param {Object} res - Express response object to send the assistant's response.
 * @return {Promise<void>} - A promise that resolves when the conversation is processed.
 */
async function continueConversation(threadId, message, res) {
  try {
    // Add user message to the existing thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });

    // Create a run to process the user's message
    const runResponse = await openai.beta.threads.runs.create(threadId, {
      assistant_id: "asst_dDBkGhNjCSlloquyL43dn99i", // Replace with your actual assistant ID
    });

    // Polling mechanism to check when the run is complete
    const maxAttempts = 10; // Set a limit on how many times we check
    const delay = 3000; // Wait for 3 seconds between checks

    let runStatus = runResponse.status;
    const runId = runResponse.id;
    let attempt = 0;

    while (attempt < maxAttempts) {
      // Check the status of the run
      const runStatusResponse = await openai.beta.threads.runs.retrieve(threadId, runId);
      runStatus = runStatusResponse.status;

      if (runStatus === "completed") {
        // Run is completed, now we list the messages to get the assistant's reply
        const messageResponse = await openai.beta.threads.messages.list(threadId, {
          limit: 20, // Adjust as needed
          order: "desc",
        });

        // Find the assistant's message in the thread
        const assistantMessage = messageResponse.data.find(
            (msg) => msg.role === "assistant",
        );

        if (assistantMessage && assistantMessage.content && assistantMessage.content[0]) {
          const assistantResponse = assistantMessage.content[0].text.value;
          // Send the assistant's response to the client
          return res.status(200).send({response: assistantResponse});
        } else {
          throw new Error("No valid assistant response found in the messages.");
        }
      } else if (runStatus === "failed") {
        throw new Error("Run failed during processing.");
      }

      // Wait before checking again
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }

    throw new Error("Run timed out before completion.");
  } catch (error) {
    console.error("Error in continueConversation:", error);
    res.status(500).send({error: "Error during conversation"});
  }
}
