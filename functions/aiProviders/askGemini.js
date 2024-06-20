const {GoogleGenerativeAI} = require("@google/generative-ai");
const functions = require("firebase-functions");

const askGemini = async (systemInstruction, prompt) => {
  try {
    // Access the API key from Firebase functions config
    const geminiApiKey = functions.config().gemini.api_key;

    // Initialize the GoogleGenerativeAI with the API key
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // Initialize the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
      generationConfig: {
        temperature: 1,
        top_p: 0.9,
        top_k: 40,
      },
    });

    // Generate content using the Gemini AI model
    const result = await model.generateContent(prompt);

    // Log the response for debugging purposes
    console.log("Complete response from Gemini API:", JSON.stringify(result));

    // Extract the relevant data from the response
    const candidates = result.response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates found in the response from Gemini API.");
    }

    // Extract text from the first candidate's content parts
    const contentParts = candidates[0].content.parts;
    if (!contentParts || contentParts.length === 0) {
      throw new Error("No content parts found in the candidate response.");
    }

    let responseText = contentParts.map((part) => part.text).join(" ");

    // Log the response text to see the exact format
    console.log("Extracted response text from Gemini API:", responseText);

    // Remove the backticks and parse the JSON response
    responseText = responseText.replace(/```json|```/g, "").trim();

    let eventData;
    try {
      eventData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error("Error parsing JSON response:", jsonError);
      throw new Error("Error parsing Gemini API response");
    }

    return eventData;
  } catch (error) {
    console.error("Error generating AI event:", error);
    throw error;
  }
};

module.exports = askGemini;
